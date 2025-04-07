import { createApp } from "vue";
import App from "../components/NewTab.vue";

let app: any;

const initApp = () => {
  if (app) {
    app.unmount();
  }
  const container = document.createElement("div");
  container.id = "vue-app";
  document.body.appendChild(container);
  app = createApp(App);
  app.mount(container);
};

initApp();
