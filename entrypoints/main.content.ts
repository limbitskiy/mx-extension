import { ContentScriptContext } from "wxt/client";
import App from "../components/App.vue";
import Overlay from "../components/Overlay.vue";
import { createApp } from "vue";
import "./reset.css";

let instance: ComponentPublicInstance;
let app;

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",

  async main(ctx) {
    if (location.search.includes("ext_data")) {
      const ui = await defineOverlay(ctx);
      ui.mount();
    } else {
      mountMainComponent(ctx);
    }

    // Re-mount when page changes
    ctx.addEventListener(window, "wxt:locationchange", async (event) => {
      if (location.search.includes("ext_data")) {
        const ui = await defineOverlay(ctx);
        ui.mount();
      } else {
        app?.unmount();
        mountMainComponent(ctx);
      }
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

function defineOverlay(ctx: ContentScriptContext) {
  return createShadowRootUi(ctx, {
    name: "vue-overlay",
    position: "modal",
    zIndex: 99999,
    onMount(container, _shadow, shadowHost) {
      const app = createApp(Overlay);
      app.mount(container);
      // shadowHost.style.pointerEvents = "none";
      return app;
    },
    onRemove(app) {
      app?.unmount();
    },
  });
}
