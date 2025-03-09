import { ComponentPublicInstance, createApp } from "vue";
import MxApp from "./MxApp.vue";

interface CustomVmProps {
  dialog?: {
    setRoute: (folders: string) => void;
  };
  setFolders?: (folders: []) => void;
  setLocalization?: (localization: {}) => void;
}

const mountEl = document.createElement("div");
document.body.appendChild(mountEl);

const props = {
  addItem: onAddLink,
  deleteItem: onDeleteLink,
  deleteFolder: onDeleteFolder,
  saveSettings: onSaveSettings,
  save: onCreateItem,
};

const vm: ComponentPublicInstance & CustomVmProps = createApp(MxApp, props).mount(mountEl);

init();

async function init() {
  const { settings } = await chrome.storage.local.get("settings");

  if (!settings) {
    console.log(`first entry`);
    changeDialogRoute("settings");
  } else {
    console.log(`regular entry`);

    const payload = {
      key: "ext_get_items",
    };

    const { folders } = await chrome.runtime.sendMessage({ action: "make_request", payload });
    vm.setFolders!(folders);

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

  // vm.setLocalization!(localization);
}

function changeDialogRoute(newRoute: string) {
  vm.dialog!.setRoute(newRoute);
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

chrome.storage.onChanged.addListener((data) => {
  if (data.folders) {
    vm.setFolders!(data.folders.newValue);
  }
});

// chrome.runtime.onMessage.addListener((message) => {});
