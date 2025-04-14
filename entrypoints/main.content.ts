import { ContentScriptContext } from "wxt/client";
import App from "../components/App.vue";
import Overlay from "../components/Overlay.vue";
import { createApp } from "vue";
import "./reset.css";

let app: ComponentPublicInstance;

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",

  async main(ctx) {
    if (location.search.includes("parser")) {
      // console.log(`includes parser`);

      const ui = await defineOverlay(ctx);

      // Mount initially
      ui.mount();

      // Re-mount when page changes
      ctx.addEventListener(window, "wxt:locationchange", (event) => {
        if (location.search.includes("parser")) {
          // console.log(`includes parser`);
          ui.mount();
        }
      });
    } else {
      // console.log(`doesn't include parser`);
      const ui = await createShadowRootUi(ctx, {
        name: "example-ui",
        position: "inline",
        anchor: "body",
        onMount: (container) => {
          const _app = createApp(App);

          app = _app.mount(container);
          return _app;
        },
        onRemove: (app) => {
          app?.unmount();
        },
      });

      ui.mount();
    }
  },
});

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

// browser.runtime.onMessage.addListener((event) => {
//   if (event.type === "openInTab") {
//     console.log("🚀 ~ event:", event);
//   }
// });

// onMessage("openHref", (href) => {
//   console.log("🚀 ~ href:", href);
// });

// const localization = {
//   app_title: "Мои хотелки",
//   save: "Сохранить",
//   delete: "Удалить",
//   // ---
//   settings: "Настройки",
//   settings_city_label: "Ваш город:",
//   settings_city_placeholder: "Москва",
//   settings_notifications_label: "Куда получать уведомления:",
//   settings_notifications_placeholder: "Москва",
//   // ---
//   confirm_telegram_title: "Подтверждение Telegram",
//   confirm_telegram_message: "Открываю Telegram bot<br />Нажмите в боте кнопку Start",
//   confirm_telegram_button: "Я подключил бота",
//   // ---
//   confirm_email_title: "Подтверждение email",
//   confirm_email_message: "На вашу почту отправлено письмо с кодом",
//   confirm_email_label: "Введите код:",
//   confirm_email_button: "Подтвердить email",
//   // ---
//   links_title: "Ссылки",
//   // ---
//   folders_title: "Папки",
//   folders_no_folders: "Тут пока ничего нету. <br /> Добавляйте хотелки, нажимая на кнопку <b>Save</b> с правой стороны экрана когда находитесь на странице товара.",
//   // ---
//   unknown_route_title: "Неизвестный сайт",
//   unknown_route_message: "Предложите нам подключить хост к нашей системе, нажав кнопку",
//   unknown_route_button: "Предложить",
//   // ---
//   404: "Неизвестная страница",
// };
