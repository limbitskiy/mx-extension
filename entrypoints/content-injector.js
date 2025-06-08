const isExtensionAlive = () => typeof chrome !== "undefined" && !!chrome.runtime?.id;

export default defineUnlistedScript(() => {
  try {
    if (location.href === "https://www.google.com/") return;

    setTimeout(async () => {
      let pageHtml = document.documentElement.outerHTML;

      if (isExtensionAlive()) {
        chrome.runtime.sendMessage({ type: "parsedPage", payload: { url: location.href, html: pageHtml } });
      }
      pageHtml = "";

      const el = document.createElement("div");
      el.className = "ext_overlay";
      el.textContent = "Please do not close this tab if you want to use MxExtension - we use it for monitoring prices";
      el.style.paddingTop = "1rem";
      el.style.position = "fixed";
      el.style.inset = 0;
      el.style.width = "100vw";
      el.style.height = "100dvh";
      el.style.backgroundColor = "white";
      el.style.zIndex = 99999;
      el.style.fontSize = "42px";
      el.style.color = "black";

      document.body.appendChild(el);
    }, 30000);
  } catch (error) {
    console.error(error);
    chrome.runtime.sendMessage({ type: "error" });
  }
});
