import { parserTabStore, settingsStore } from "@/store";
import { initRequest, readTasks, addLink, makeRequest, updateTasks } from "./api";
import { checkTasks } from "./tasks";
import { QueueController } from "./QueueController";
import {
  parserTabIsOpen,
  createParserTab,
  updateParserTabUrl,
  isParserTab,
  injectParserTabScript,
  isParserTabActive,
} from "./parserTab";

const debugMode = import.meta.env.WXT_DEBUG;

const READ_TASKS_INTERVAL_IN_MINUTES = debugMode ? 0.5 : 4.5;
const CHECK_TASKS_INTERVAL_IN_MINUTES = debugMode ? 0.6 : 5;

let queueController = new QueueController(updateTab);

export default defineBackground(() => {
  // console.log(import.meta.env.WXT_API_URL, { id: browser.runtime.id });

  // parserTabIsOpen().then((isOpen) => {
  //   if (!isOpen) {
  //     queueController.finish();
  //   }
  // });
  createParserTab();

  chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    console.log({ reason });

    await init();
  });

  browser.alarms.onAlarm.addListener(async (alarm) => {
    const registered = await isRegistered();

    if (!registered) {
      return;
    }

    switch (alarm.name) {
      case "read-tasks": {
        console.log("reading tasks");

        try {
          await readTasks();
        } catch (error) {
          console.error("Error while reading tasks: ", error);
        }
        break;
      }
      case "check-tasks": {
        try {
          await checkTasks(CHECK_TASKS_INTERVAL_IN_MINUTES, queueController);
        } catch (error) {
          console.error("Error while checking tasks: ", error);
        }
        break;
      }
    }
  });

  browser.tabs.onRemoved.addListener(async (tabId) => {
    const parserTab = await parserTabStore.getValue();

    if (tabId === parserTab?.id) {
      console.log(`parser tab closed`);
      queueController.finish();
    }
  });

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const parserTab = await parserTabStore.getValue();

    if (tabId === parserTab?.id && changeInfo.status === "complete") {
      try {
        await injectParserTabScript();
      } catch (error) {
        console.error("Error injecting script:", error);
        queueController.finish();

        const isActive = await isParserTabActive();

        if (isActive) {
          console.log(`Opening new parser tab`);
          // createParserTab();
        } else {
          console.log(`Restarting parser tab`);
          // restartParserTab();
        }
      }
    }
  });

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
      switch (message.type) {
        case "isParserTab": {
          try {
            const result = await isParserTab(sender.tab?.id);
            sendResponse(result);
          } catch (error) {
            console.error("Error trying to get parser tab: ", error);
            sendResponse(error);
          }
          break;
        }
        case "makeRequest": {
          try {
            const result = await makeRequest(message.payload);
            sendResponse(result);
          } catch (error) {
            console.error("Error executing makeRequest: ", error);
            sendResponse(error);
          }
          break;
        }
        case "closeUIPopup": {
          try {
            const queryOptions = { active: true, lastFocusedWindow: true };
            const [tab] = await chrome.tabs.query(queryOptions);

            if (tab?.id) {
              browser.tabs.sendMessage(tab.id, { type: "closeUIPopup" });
            }
          } catch (error) {
            console.error("Error while closing UI popup: ", error);
          } finally {
            return false;
          }
        }
        case "parsedPage": {
          try {
            if (!queueController.currentItem) return;

            const data = { ...message.payload, id: queueController.currentItem?.id };
            await updateTasks(data);
          } catch (error) {
            console.error("Error sending a parsed page: ", error);
          } finally {
            queueController.finish();
            return false;
          }
        }
        case "addItem": {
          try {
            const queryOptions = { active: true, lastFocusedWindow: true };
            const [tab] = await chrome.tabs.query(queryOptions);

            await browser.scripting.executeScript({
              target: { tabId: tab?.id! },
              files: ["/htmlGetter.js"],
            });
          } catch (error) {
            console.error("Error while executing htmlGetter script: ", error);
          } finally {
            return false;
          }
        }
        case "addItemData": {
          const queryOptions = { active: true, lastFocusedWindow: true };
          const [tab] = await chrome.tabs.query(queryOptions);

          try {
            const response = await addLink(message.payload);

            if (tab?.id) {
              browser.tabs.sendMessage(tab.id, {
                type: "showToast",
                payload: {
                  text: "message" in response ? response.message : "Link added",
                  type: "success",
                },
              });
            }
          } catch (error: unknown) {
            console.error("Error while adding link: ", error);

            queueController.finish();

            if (tab?.id) {
              browser.tabs.sendMessage(tab.id, {
                type: "showToast",
                payload: {
                  text: error instanceof Error ? error.message : "Error adding link",
                  type: "error",
                },
              });
            }
          } finally {
            return false;
          }
        }
        case "getActiveTabUrl": {
          try {
            const queryOptions = { active: true, lastFocusedWindow: true };
            const [tab] = await chrome.tabs.query(queryOptions);

            if (tab?.id) {
              sendResponse(tab.url);
            }
          } catch (error) {
            console.error("Error while getting active tab URL: ", error);
            sendResponse(error);
          }
          break;
        }
      }
    })();
    return true;
  });
});

async function restartParserTab() {
  const parserTab = await parserTabStore.getValue();

  browser.tabs.remove(parserTab?.id!);
  createParserTab({ active: true });
}

const init = async () => {
  browser.alarms.create("read-tasks", {
    periodInMinutes: READ_TASKS_INTERVAL_IN_MINUTES,
  });
  browser.alarms.create("check-tasks", {
    periodInMinutes: CHECK_TASKS_INTERVAL_IN_MINUTES,
  });
  const registered = await isRegistered();
  if (!registered) {
    console.log(`user is not registered`);
    await initRequest();
  } else {
    console.log(`user is registered`);
    await readTasks();
  }
};

async function updateTab(item: { id: string; url?: string }) {
  const isOpen = await parserTabIsOpen();

  if (!isOpen) {
    queueController.finish();
    await createParserTab();
  }

  const { url } = item;

  if (!url) {
    return;
  }

  await updateParserTabUrl(url);
}

const isRegistered = async () => {
  const settings = await settingsStore.getValue();
  return !!settings?.registered;
};
