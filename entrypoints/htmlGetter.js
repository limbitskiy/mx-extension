const isExtensionAlive = () => typeof chrome !== "undefined" && !!chrome.runtime?.id;

export default defineUnlistedScript(() => {
  try {
    let pageHtml = document.documentElement.outerHTML;

    if (isExtensionAlive()) {
      chrome.runtime.sendMessage({
        type: "addItemData",
        payload: { url: location.href, title: document.title, html: pageHtml },
      });
    }
  } catch (error) {
    console.error(error);
    chrome.runtime.sendMessage({ type: "error" });
  }
});
