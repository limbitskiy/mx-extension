import { defineBackground } from "wxt/sandbox";
import { browser } from "wxt/browser";
import axios from "axios";

// check storage:
// chrome.storage.local.get(null, (data) => console.log(data))

export default defineBackground(async () => {
  const apiHost = "https://api-dev.tapsmart.io/main";
  let tab;
  const UPDATE_CHECK_INTERVAL = 5000;

  // runs on update or installed
  browser.runtime.onInstalled.addListener(async (data) => {
    init();

    async function init() {
      // set task update alarm
      // await chrome.alarms.create("task-update", {
      //   // delayInMinutes: 1,
      //   periodInMinutes: UPDATE_CHECK_INTERVAL / 60000 / 2,
      // });

      const settings = await storage.getItem("local:settings");

      if (!settings) {
        firstEntry();
      } else {
        console.log(`regular entry`);
      }

      // getTasks();
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

        if (data.folders) {
          await storage.setItem("local:folders", data.folders);
        }

        if (data.tasks) {
          await storage.setItem("local:tasks", data.tasks);
        }

        return data;
      } catch (error) {
        console.error(error);
        return { error };
      }
    }

    onMessage("makeRequest", (message) => {
      // console.log("🚀 ~ message:", message);
      return makeRequest(message.data);
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
