// import { ContentScriptContext } from "wxt/client";
import App from "../components/App.vue";
import { createApp } from "vue";
import "./reset.css";
// import { sendMessage } from "!/utils/messaging";

let app;

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "example-ui",
      position: "inline",
      anchor: "body",
      onMount: (container) => {
        // Define how your UI will be mounted inside the container
        app = createApp(App, {
          addItem: onAddLink,
          deleteItem: onDeleteLink,
          deleteFolder: onDeleteFolder,
          saveSettings: onSaveSettings,
          save: onCreateItem,
        });
        app.mount(container);
        init();
        console.log(app);

        return app;
      },
      onRemove: (app) => {
        // Unmount the app when the UI is removed
        app?.unmount();
      },
    });

    console.log(ui);

    // 4. Mount the UI
    ui.mount();
  },
});

async function init() {
  const settings = await storage.getItem("local:settings");

  if (!settings) {
    console.log(`first entry`);
    changeDialogRoute("settings");
  } else {
    console.log(`regular entry`);

    const payload = {
      key: "ext_get_items",
    };

    console.log(`sending message`);

    const folders = await sendMessage("makeRequest", payload);
    console.log("🚀 ~ init ~ folders:", folders);
    // const { folders } = await browser.runtime.sendMessage({ action: "make_request", payload });
    app?.setFolders!(folders);

    // changeDialogRoute("folders");
  }

  const localization = {
    app_title: "Мои хотелки",
    save: "Сохранить",
    delete: "Удалить",
    // ---
    settings: "Настройки",
    settings_city_label: "Ваш город:",
    settings_city_placeholder: "Москва",
    settings_notifications_label: "Куда получать уведомления:",
    settings_notifications_placeholder: "Москва",
    // ---
    confirm_telegram_title: "Подтверждение Telegram",
    confirm_telegram_message: "Открываю Telegram bot<br />Нажмите в боте кнопку Start",
    confirm_telegram_button: "Я подключил бота",
    // ---
    confirm_email_title: "Подтверждение email",
    confirm_email_message: "На вашу почту отправлено письмо с кодом",
    confirm_email_label: "Введите код:",
    confirm_email_button: "Подтвердить email",
    // ---
    links_title: "Ссылки",
    // ---
    folders_title: "Папки",
    folders_no_folders: "Тут пока ничего нету. <br /> Добавляйте хотелки, нажимая на кнопку <b>Save</b> с правой стороны экрана когда находитесь на странице товара.",
    // ---
    unknown_route_title: "Неизвестный сайт",
    unknown_route_message: "Предложите нам подключить хост к нашей системе, нажав кнопку",
    unknown_route_button: "Предложить",
    // ---
    404: "Неизвестная страница",
  };

  // app?.setLocalization!(localization);
}

function changeDialogRoute(newRoute: string) {
  // app?.dialog!.setRoute(newRoute);
}

function onAddLink() {
  console.log(`add link`);
}

function onDeleteLink() {
  console.log(`delete link`);
}

function onDeleteFolder() {
  console.log(`delete folder`);
}

async function onSaveSettings(data: {}) {
  console.log(data);

  const payload = {
    key: "ext_set_profile",
    data,
  };

  const { status } = await chrome.runtime.sendMessage({ action: "make_request", payload });

  if (status !== "ok") {
    console.error(`Did not recieve an OK status from server. Got status: ${status}`);
  } else {
    chrome.storage.local.set({ settings: { confirmed: true } });
  }
}

async function onCreateItem() {
  console.log(`creating link...`);

  const addItemPayload = {
    key: "ext_add_item",
    data: {
      url: location.href,
      html: document.body.innerHTML,
    },
  };

  await chrome.runtime.sendMessage({ action: "make_request", payload: addItemPayload });
}

// export default defineContentScript({
//   matches: ["*://*/*"],
//   cssInjectionMode: "ui",

//   async main(ctx) {
//     const ui = await defineOverlay(ctx);

//     ui.mount();

//     ctx.addEventListener(window, "wxt:locationchange", (event) => {
//       ui.mount();
//     });
//   },
// });

// function defineOverlay(ctx: ContentScriptContext) {
//   return createIntegratedUi(ctx, {
//     position: "inline",
//     anchor: "body",
//     onMount: (container) => {
//       const app = createApp(App);
//       app.mount(container);
//       return app;
//     },
//     onRemove(app) {
//       app?.unmount();
//     },
//   });
// }
