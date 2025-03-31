import { defineBackground } from "wxt/sandbox";
import { browser } from "wxt/browser";
import axios from "axios";
// import { onMessage } from "./messaging";

// check storage:
// chrome.storage.local.get(null, (data) => console.log(data))
interface Item {
  discount: number;
  id: string;
  name: string;
  price: number;
  url: string;
}

interface Folder {
  discount: number;
  id: string;
  items: Item[];
  itemCnt: number;
  name: string;
  timer: string; // "16:25"
}

interface Task {
  id: number;
  period: number; // in seconds
  url: string;
  lastUpdated?: number;
}

interface ResponseData {
  folders: Folder[];
  tasks: Task[];
}

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
  // try {
  //   const response = await axios.post<{ service: object; data: ResponseData }>("https://api-dev.tapsmart.io/main", requestBody);
  //   const { service, data } = response.data;
  //   if (service) {
  //     console.log(`setting service`);
  //     await storage.setItem("local:service", service);
  //   }
  //   if (data.folders) {
  //     await storage.setItem("local:folders", data.folders);
  //   }
  //   if (data.tasks) {
  //     await storage.setItem("local:tasks", data.tasks);
  //   }
  //   return data;
  // } catch (error) {
  //   console.error(error);
  // }
}

onMessage("makeRequest", (message) => {
  console.log("🚀 ~ message:", message);
});

// browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log(`got message`);

//   console.log(request);

//   const { action, payload } = request;

//   if (action === "make_request") {
//     makeRequest(payload)
//       .then((result) => sendResponse(result))
//       .catch((error) => sendResponse({ error: error.message }));

//     return true;
//   }
// });
