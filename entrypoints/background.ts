import { defineBackground } from "wxt/sandbox";
import { browser, Tabs } from "wxt/browser";
import axios from "axios";
import { QueueController } from "@/utils/QueueController";

interface Settings {
  confirmed: boolean;
}

interface DialogSettings {
  [key: string]: boolean;
}
// check storage:
// chrome.storage.local.get(null, (data) => console.log(data))
const apiHost = "https://api-dev.tapsmart.io/main";
const GET_TASKS_INTERVAL_IN_MINUTES = 4.5;
const CHECK_TASKS_INTERVAL_IN_MINUTES = 5;
let parserTab: Tabs.Tab;
let parserTabData = {
  waitingForUpdate: false,
};
let queueController = new QueueController(updateTab);

export default defineBackground({
  type: "module",
  main() {
    (browser.action ?? browser.browserAction).onClicked.addListener(async (tab) => {
      const dialogSettings = (await storage.getItem("local:dialogSettings")) ?? {};
      dialogSettings[tab?.id] = true;
      await storage.setItem("local:dialogSettings", dialogSettings);
    });

    // runs on update or installed
    browser.runtime.onInstalled.addListener(async (data) => {
      init();

      await createIfNoParserTab();

      setTimeout(async () => {
        await browser.scripting.executeScript({
          target: { tabId: parserTab?.id },
          files: ["/content-injector.js"],
        });
      }, 1000);
    });

    browser.alarms.onAlarm.addListener((alarm) => {
      switch (alarm.name) {
        case "task-update": {
          console.log("getting tasks at", new Date());
          getTasks();
          break;
        }
        case "task-check": {
          checkTasks();
          break;
        }
      }
    });

    browser.tabs.onRemoved.addListener(async (tabId) => {
      await closeCurrentTabDialog(tabId);

      if (tabId === parserTab?.id) {
        console.log(`parser tab closed`);
        queueController.finish();
      }
    });

    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (parserTabData.waitingForUpdate && tabId === parserTab?.id && changeInfo.status === "complete") {
        try {
          await injectScriptIntoTab();
        } catch (error) {
          console.error("Error injecting script:", error);
        } finally {
          parserTabData.waitingForUpdate = false;
        }
      }

      // await closeCurrentTabDialog(tabId);
    });

    onMessage("makeRequest", (message) => {
      return makeRequest(message.data);
    });

    onMessage("requestTabId", (data) => {
      return data?.sender?.tab?.id;
    });

    onMessage("isParserTab", (data) => {
      return data?.sender?.tab?.id === parserTab?.id;
    });

    onMessage("sendParsedPage", async (page) => {
      const { data } = page;

      const payload = {
        key: "ext_update_tasks",
        data,
      };

      if (!queueController.currentItem) return;

      payload.data.id = queueController.currentItem?.id;

      await makeRequest(payload);

      queueController.finish();
    });

    onMessage("reloadParserTab", async () => {
      await browser.tabs.reload(parserTab?.id, { bypassCache: true });
    });

    onMessage("register", async () => {
      console.log(`user registered`);
      const dialogSettings = (await storage.getItem("local:dialogSettings")) ?? {};
      Object.keys(dialogSettings).forEach((key) => {
        dialogSettings[key] = false;
      });
      await storage.setItem("local:dialogSettings", dialogSettings);
    });
  },
});

async function init() {
  // set task update alarm
  browser.alarms.create("task-update", {
    periodInMinutes: GET_TASKS_INTERVAL_IN_MINUTES,
  });

  browser.alarms.create("task-check", {
    periodInMinutes: CHECK_TASKS_INTERVAL_IN_MINUTES,
  });

  const settings: Settings | null = await storage.getItem("local:settings");

  if (!settings?.confirmed) {
    firstEntry();
  } else {
    console.log(`regular entry`);
    getTasks();
  }
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

async function getTasks() {
  const settings: Settings | null = await storage.getItem("local:settings");
  if (!settings?.confirmed) return;

  const payload = {
    key: "ext_read_tasks",
  };

  const result = await makeRequest(payload);

  if ("tasks" in result) {
    await handleNewTasks(result.tasks ?? []);
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
  console.log(`checking tasks`);

  const tasks = (await storage.getItem<Task[]>("local:tasks")) ?? [];
  const updatedTasks: Task[] = [];

  if (tasks?.length) {
    tasks.forEach(async (task) => {
      task.updateIn! -= CHECK_TASKS_INTERVAL_IN_MINUTES * 60000;

      if (task.updateIn! <= 0) {
        queueController.add(task);
        task.updateIn = task.period;
      }

      updatedTasks.push(task);
    });
  }

  await storage.setItem("local:tasks", updatedTasks);
}

async function updateTab(item: { url?: string }) {
  try {
    await createIfNoParserTab();

    parserTabData.waitingForUpdate = true;

    await browser.tabs.update(parserTab?.id, {
      url: item.url,
    });
  } catch (error) {
    console.error(`Error in update function. Reloading parser tab`, error);
    await browser.tabs.reload();
  }
}

async function injectScriptIntoTab() {
  return new Promise((res) => {
    setTimeout(async () => {
      const parserTabExists = await tabExists(parserTab?.id);

      if (parserTabExists) {
        await browser.scripting.executeScript({
          target: { tabId: parserTab.id },
          files: ["/content-injector.js"],
        });
        res(true);
      }
    }, 1500);
  });
}

async function closeCurrentTabDialog(tabId: number) {
  const dialogSettings: DialogSettings | null = await storage.getItem("local:dialogSettings");

  if (dialogSettings && tabId in dialogSettings) {
    console.log(`closing tab`);

    delete dialogSettings[tabId];
    await storage.setItem("local:dialogSettings", dialogSettings);
  }
}

async function createIfNoParserTab() {
  const parserTabExists = await tabExists(parserTab?.id);

  if (!parserTabExists) {
    parserTab = await browser.tabs.create({
      url: "https://google.com",
      active: false,
    });
  }
}

async function tabExists(tabId: number): Promise<boolean> {
  if (!tabId) return false;

  try {
    await browser.tabs.get(tabId);
    return true;
  } catch (e: any) {
    if (e.message.includes("No tab with id")) {
      return false;
    }
    throw e;
  }
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
