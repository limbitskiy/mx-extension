import { ContentScriptContext } from "wxt/client";
import App from "../components/App.vue";
import { createApp } from "vue";
import "./reset.css";

let instance: ComponentPublicInstance;
let app;

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",

  async main(ctx) {
    await new Promise((res) => setTimeout(res, 3000));

    if (!ctx.isValid) {
      console.warn("Extension context invalidated, stopping script.");
      return;
    }

    const overlay = document.querySelector(".ext_overlay");

    if (overlay) return;

    mountMainComponent(ctx);

    // Re-mount when page changes
    ctx.addEventListener(window, "wxt:locationchange", async (event) => {
      app?.unmount();
      mountMainComponent(ctx);
    });
  },
});

async function mountMainComponent(ctx: ContentScriptContext) {
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
