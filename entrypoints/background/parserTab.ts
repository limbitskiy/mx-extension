import { parserTabStore } from "@/store";

interface CreateParserTabOptions {
  active?: boolean;
}

export const createParserTab = async (options?: CreateParserTabOptions) => {
  // const parserTab = await browser.tabs.create({
  //   url: "https://google.com",
  //   active: Boolean(options?.active),
  // });

  // await parserTabStore.setValue(parserTab);

  const newWindow = await browser.windows.create({
    type: "popup",
    state: "maximized",
    // url: browser.runtime.getURL("test.html"),
  });

  const parserTab = await browser.tabs.create({
    windowId: newWindow.id,
    url: "https://google.com",
  });

  await parserTabStore.setValue(parserTab);

  // console.log(newWindow.tabs![0]);

  // const parserTab = await browser.tabs.update(newWindow.tabs![0].id!, { autoDiscardable: false });

  // await parserTabStore.setValue(parserTab.id!);
};

export const parserTabIsOpen = async () => {
  const parserTab = await parserTabStore.getValue();

  if (!parserTab || !parserTab?.id) {
    return false;
  }

  try {
    const tab = await browser.tabs.get(parserTab?.id);

    if (tab?.id) {
      return true;
    }
  } catch (e: any) {
    console.log(e);
    return false;
  }
};

export const updateParserTabUrl = async (url: string) => {
  const parserTab = await parserTabStore.getValue();

  await browser.tabs.update(parserTab.id!, {
    url,
  });

  await parserTabStore.setValue(parserTab);
};

export const injectParserTabScript = async () => {
  const parserTab = await parserTabStore.getValue();

  await browser.scripting.executeScript({
    target: { tabId: parserTab?.id! },
    files: ["/content-injector.js"],
  });
};

export const isParserTab = async (tabId?: number) => {
  const parserTab = await parserTabStore.getValue();
  return tabId === parserTab?.id;
};

export const isParserTabActive = async (tabId?: number) => {
  const parserTab = await parserTabStore.getValue();

  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab.id === parserTab?.id;
};
