export const isParserTab = async () => {
  return await browser.runtime.sendMessage({ type: "isParserTab" });
};
