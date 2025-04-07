import { defineBackground } from "wxt/sandbox";
import { browser } from "wxt/browser";
import axios from "axios";

// check storage:
// chrome.storage.local.get(null, (data) => console.log(data))

export default defineBackground(async () => {
  const apiHost = "https://api-dev.tapsmart.io/main";
  let tab;
  const UPDATE_CHECK_INTERVAL_IN_MINUTES = 1;

  (browser.action ?? browser.browserAction).onClicked.addListener(async (tab) => {
    console.log(`button click`);
    await storage.setItem("local:isDialogOpen", true);
  });

  // runs on update or installed
  browser.runtime.onInstalled.addListener(async (data) => {
    init();

    const tab = await browser.tabs.create({
      url: browser.runtime.getURL("new-tab.html"),
      active: false,
    });

    async function init() {
      // set task update alarm
      browser.alarms.create("task-update", {
        periodInMinutes: UPDATE_CHECK_INTERVAL_IN_MINUTES,
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

        if (service) {
          console.log(`setting service`);
          await storage.setItem("local:service", service);
        }

        if ("folders" in data) {
          await storage.setItem("local:folders", data.folders);
        }

        if ("tasks" in data) {
          await storage.setItem("local:tasks", data.tasks);
        }

        if ("locale" in data) {
          await storage.setItem("local:locale", data.locale);
        }

        if ("url_icon" in data) {
          await storage.setItem("local:url_icon", data.url_icon);
        }

        return data;
      } catch (error) {
        console.error(error);
        return { error };
      }
    }

    onMessage("makeRequest", (message) => {
      console.log("🚀 ~ message:", message);
      return makeRequest(message.data);
    });

    browser.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === "task-update") {
        console.log("getting tasks at", new Date());
        getTasks();
      }
    });

    // tab = await browser.tabs.create({
    //   // url: browser.runtime.getURL("/new-tab.html"),
    //   url: "https://market.yandex.ru",
    //   active: false,
    // });

    // const res = await browser.scripting.executeScript({
    //   target: { tabId: tab.id },
    //   files: ["content-scripts/tab.js"],
    // });

    // console.log("🚀 ~ browser.runtime.onInstalled.addListener ~ res:", res);
    // if (reason !== "install") {
    // }
    // setTimeout(async () => {
    //   await browser.tabs.update(tab.id, {
    //     url: "https://www.ozon.ru/#content/",
    //   });
    // }, 5000);
    // setTimeout(async () => {
    //   await browser.tabs.update(tab.id, {
    //     url: "https://www.wildberries.ru/#content/",
    //   });
    // }, 10000);
    // setTimeout(async () => {
    //   await browser.tabs.update(tab.id, {
    //     url: "https://www.booking.com/#content/",
    //   });
    // }, 15000);
  });
});
