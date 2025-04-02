// import { ContentScriptContext } from "wxt/client";
import App from "../components/App.vue";
import { createApp } from "vue";
import "./reset.css";

interface MxAppProps {
  addItem?: () => void;
  deleteItem?: () => void;
  deleteFolder?: () => void;
  saveSettings?: () => void;
  save?: () => void;
  setFolders?: (folders: Folder[]) => void;
  setLocalization?: (locale: Locale[]) => void;
  dialog?: {
    setRoute: (route: string) => void;
  };
}

let app: ComponentPublicInstance & MxAppProps;

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "example-ui",
      position: "inline",
      anchor: "body",
      onMount: (container) => {
        const _app = createApp(App, {
          addItem: onAddLink,
          deleteItem: onDeleteLink,
          deleteFolder: onDeleteFolder,
          saveSettings: onSaveSettings,
          save: onCreateItem,
        });

        app = _app.mount(container);
        init();

        return _app;
      },
      onRemove: (app) => {
        app?.unmount();
      },
    });

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

    const response = await sendRequest(payload);

    if (response?.folders) {
      app.setFolders!(response.folders);
    }

    if (response?.locale) {
      app.setLocalization!(response.locale);
    }
  }

  // app?.setLocalization!(localization);
}

function changeDialogRoute(newRoute: string) {
  app?.dialog!.setRoute(newRoute);
}

function onAddLink() {
  console.log(`add link`);
}

async function onDeleteLink(itemId: string) {
  console.log(`delete link`);

  const payload = {
    key: "ext_delete_item",
    data: {
      itemId,
    },
  };

  const response = await sendRequest(payload);

  if (response && "folders" in response) {
    app.setFolders!(response.folders);
  }
}

async function onDeleteFolder(folderId: string) {
  console.log(`delete folder`);

  const payload = {
    key: "ext_delete_folder",
    data: {
      folderId,
    },
  };

  const response = await sendRequest(payload);

  if (response && "folders" in response) {
    app.setFolders!(response.folders);
  }
}

async function onSaveSettings(data: {}) {
  const payload = {
    key: "ext_set_profile",
    data,
  };

  const response = await sendRequest(payload);

  if (response) {
    console.log(`saving data`);
    await storage.setItem("local:settings", { confirmed: true });
  }
}

async function onCreateItem() {
  const payload = {
    key: "ext_add_item",
    data: {
      url: location?.href,
      html: document.body.innerHTML,
      title: document.title,
    },
  };

  const response = await sendRequest(payload);

  if (response && "folders" in response) {
    app.setFolders!(response.folders);
  }
}

async function sendRequest(payload: RequestData) {
  const response = await sendMessage("makeRequest", payload);

  if ("error" in response) {
    console.error("Ошибка:", response.error);
  } else {
    return response;
  }
}

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
