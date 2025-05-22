import { ContentScriptContext } from "wxt/client";
import App from "../components/App.vue";
import { createApp } from "vue";
import "./reset.css";
import { isParserTab } from "@/api";

let instance: ComponentPublicInstance;
let app;

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",

  async main(ctx) {
    await new Promise((res) => setTimeout(res, 3000));

    const isThisParserTab = await isParserTab();

    // const overlay = document.querySelector(".ext_overlay");

    if (isThisParserTab) return;

    // console.log(`no overlay`);

    mountMainComponent(ctx);

    // Re-mount when page changes
    ctx.addEventListener(window, "wxt:locationchange", async (event) => {
      app?.unmount();
      mountMainComponent(ctx);
    });

    ctx.onInvalidated(() => {
      console.warn("Extension context is invalid.");
      app?.unmount();
    });
  },
});

async function mountMainComponent(ctx: ContentScriptContext) {
  if (!ctx.isValid) {
    console.warn("Extension context invalidated, stopping script.");
    return;
  }

  const ui = await createShadowRootUi(ctx, {
    name: "example-ui",
    position: "inline",
    anchor: "body",
    onMount: (container) => {
      app = createApp(App);

      instance = app.mount(container);
      return app;
    },
    onRemove: (app) => {
      app?.unmount();
    },
  });

  ui.mount();
}
