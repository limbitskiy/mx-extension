import { parserTabStore } from "@/store";

interface CreateParserTabOptions {
  active?: boolean;
}

export const createParserTab = async (options?: CreateParserTabOptions) => {
  const parserTab = await browser.tabs.create({
    url: "https://google.com",
    active: Boolean(options?.active),
  });

  await parserTabStore.setValue(parserTab);
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
