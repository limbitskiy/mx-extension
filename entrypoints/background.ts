import { defineBackground } from "wxt/sandbox";
import { browser } from "wxt/browser";
import axios from "axios";

let tab;
const UPDATE_CHECK_INTERVAL = 5000;

export default defineBackground(() => {
  console.log(browser);

  // runs on update or installed
  browser.runtime.onInstalled.addListener(async (data) => {
    console.log(`starting on onConnect`);
    console.log(data);

    init();

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

async function init() {
  // set task update alarm
  // await chrome.alarms.create("task-update", {
  //   // delayInMinutes: 1,
  //   periodInMinutes: UPDATE_CHECK_INTERVAL / 60000 / 2,
  // });

  const settings = await storage.getItem("local:settings");
  console.log("🚀 ~ init ~ settings:", settings);

  if (!settings) {
    console.log(`first entry`);

    firstEntry();
  } else {
    console.log(`regular entry`);
  }

  // getTasks();
}

async function firstEntry() {
  const payload = {
    key: "ext_init",
    data: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      browser_language: navigator.language,
    },
  };

  const result = await makeRequest(payload);
}

async function makeRequest(requestBody: {}) {
  try {
    const response = await axios.post<{ service: {}; data: {} }>("https://api-dev.tapsmart.io/main", requestBody);

    const { service, data } = response.data;

    // const { service, data } = await response.json();

    if (service) {
      console.log(`setting service`);

      await storage.setItem("local:service", service);
    }

    // if (data.folders) {
    //   await chrome.storage.local.set({ folders: data.folders });
    // }

    // if (data.tasks) {
    //   await chrome.storage.local.set({ tasks: data.tasks });
    // }

    return data;
  } catch (error) {
    console.error(error);
  }
}
