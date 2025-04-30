export default defineUnlistedScript(() => {
  let pageHtml = "";

  const el = document.createElement("div");
  el.className = "ext_overlay";
  el.textContent = "Please do not close this tab if you want to use MxExtension - we use it for monitoring prices";
  el.style.paddingTop = "1rem";
  el.style.position = "absolute";
  el.style.inset = 0;
  el.style.width = "100vw";
  el.style.height = "100dvh";
  el.style.backgroundColor = "white";
  el.style.zIndex = 99999;
  el.style.fontSize = "42px";
  el.style.color = "black";

  document.body.appendChild(el);

  setTimeout(async () => {
    pageHtml = document.documentElement.outerHTML;
    await sendMessage("sendParsedPage", { url: location.href, html: pageHtml });
    pageHtml = "";
  }, 30000);
});
