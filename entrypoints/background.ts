import { defineBackground } from "wxt/sandbox";
import { browser, Tabs } from "wxt/browser";
import axios from "axios";
import { QueueController } from "@/utils/QueueController";

// check storage:
// chrome.storage.local.get(null, (data) => console.log(data))
const apiHost = "https://api-dev.tapsmart.io/main";
const GET_TASKS_INTERVAL_IN_MINUTES = 4.5;
const CHECK_TASKS_INTERVAL_IN_MINUTES = 5;
let parserTab: Tabs.Tab;

export default defineBackground(() => {
  (browser.action ?? browser.browserAction).onClicked.addListener(async (tab) => {
    const dialogSettings = (await storage.getItem("local:dialogSettings")) ?? {};
    // const settings = await storage.getItem("local:settings");
    dialogSettings[tab.id] = true;
    await storage.setItem("local:dialogSettings", dialogSettings);
  });

  // runs on update or installed
  browser.runtime.onInstalled.addListener(async (data) => {
    const queueController = new QueueController(updateTab);

    init();

    parserTab = await browser.tabs.create({
      url: browser.runtime.getURL("/new-tab.html"),
      active: false,
    });

    async function init() {
      // set task update alarm
      browser.alarms.create("task-update", {
        periodInMinutes: GET_TASKS_INTERVAL_IN_MINUTES,
      });

      browser.alarms.create("task-check", {
        periodInMinutes: CHECK_TASKS_INTERVAL_IN_MINUTES,
      });

      const settings = await storage.getItem("local:settings");

      if (!settings?.confirmed) {
        firstEntry();
      } else {
        console.log(`regular entry`);
        getTasks();
      }
    }

    async function getTasks() {
      console.log(`starting get tasks`);

      const settings = await storage.getItem("local:settings");
      if (!settings?.confirmed) return;

      const payload = {
        key: "ext_read_tasks",
      };

      const result = await makeRequest(payload);

      if ("tasks" in result) {
        await handleNewTasks(result.tasks ?? []);
      }
      console.log("🚀 ~ getTasks ~ result:", result);
    }

    async function firstEntry() {
      console.log(`first entry`);

      const payload = {
        key: "ext_init",
        data: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          browser_language: navigator.language,
        },
      };

      await makeRequest(payload);
    }

    async function makeRequest(requestBody: RequestData): Promise<ResponseData | { error: unknown }> {
      try {
        const localService = await storage.getItem("local:service");

        if (localService) {
          requestBody.service = localService;
        }
        const response = await axios.post<{ service: object; data: ResponseData }>(apiHost, requestBody);

        const { service, data } = response.data;

        if (!data) return { error: "no data" };

        if (service) {
          console.log(`setting service`);
          await storage.setItem("local:service", service);
        }

        if ("folders" in data) {
          await storage.setItem("local:folders", data.folders);
        }

        if ("tasks" in data) {
          await handleNewTasks(data.tasks);
          // await storage.setItem("local:tasks", data.tasks);
        }

        if ("locale" in data) {
          await storage.setItem("local:locale", data.locale);
        }

        if ("url_icon" in data) {
          await storage.setItem("local:url_icon", data.url_icon);
        }

        if ("region" in data) {
          const settings = await storage.getItem("local:settings");
          await storage.setItem("local:settings", { ...(settings as {}), region: data.region });
        }

        if ("contactUrl" in data) {
          const settings = await storage.getItem("local:settings");
          await storage.setItem("local:settings", { ...(settings as {}), contactUrl: data.contactUrl });
        }

        return data;
      } catch (error) {
        console.error(error);
        return { error };
      }
    }

    async function handleNewTasks(newTasks: Task[]) {
      const localTasks = (await storage.getItem<Task[]>("local:tasks")) ?? [];
      const changedTasks: Task[] = [];

      newTasks.forEach((newTask) => {
        const localTask = localTasks.find((localTask) => localTask.id === newTask.id);

        if (localTask) {
          if (localTask.period != newTask.period) {
            localTask.period = newTask.period;
          }
          changedTasks.push(localTask);
        } else {
          changedTasks.push({ ...newTask, updateIn: newTask.period });
        }
      });

      await storage.setItem("local:tasks", changedTasks);
    }

    async function checkTasks() {
      const tasks = (await storage.getItem<Task[]>("local:tasks")) ?? [];
      const updatedTasks: Task[] = [];

      if (tasks?.length) {
        tasks.forEach(async (task) => {
          task.updateIn! -= CHECK_TASKS_INTERVAL_IN_MINUTES * 60000;

          if (task.updateIn! < 0) {
            queueController.add(task.url);
            task.updateIn = task.period;
            updatedTasks.push(task);
          }
        });
      }

      await storage.setItem("local:tasks", updatedTasks);
    }

    async function updateTab(url: string) {
      console.log(String(url));

      const _url = new URL(url);
      _url.searchParams.set("ext_data", "true");

      await browser.tabs.update(parserTab.id, {
        url: _url.toString(),
      });
    }

    onMessage("makeRequest", (message) => {
      console.log("🚀 ~ message:", message);
      return makeRequest(message.data);
    });

    onMessage("requestTabId", (data) => {
      return data?.sender?.tab?.id;
    });

    onMessage("sendParsedPage", async (page) => {
      console.log(`got a parsed page : ${page.data.url}`);

      const { data } = page;

      const payload = {
        key: "ext_update_tasks",
        data,
      };

      await makeRequest(payload);

      queueController.finish();
    });

    async function closeCurrentTabDialog(tabId: number) {
      const dialogSettings = await storage.getItem("local:dialogSettings");

      if (dialogSettings && tabId in dialogSettings) {
        delete dialogSettings[tabId];
        await storage.setItem("local:dialogSettings", dialogSettings);
      }
    }

    browser.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === "task-update") {
        console.log("getting tasks at", new Date());
        getTasks();
      }
    });

    browser.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === "task-check") {
        console.log("checking tasks at", new Date());
        checkTasks();
      }
    });

    browser.tabs.onRemoved.addListener(async (tabId) => {
      await closeCurrentTabDialog(tabId);
    });

    browser.tabs.onUpdated.addListener(async (tabId) => {
      await closeCurrentTabDialog(tabId);
    });
  });
});
