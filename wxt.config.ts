import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    permissions: ["storage", "alarms", "tabs", "scripting", "activeTab"],
    host_permissions: ["<all_urls>"],
    action: {},
    web_accessible_resources: [
      {
        resources: ["content-injector.js"],
        matches: ["<all_urls>"],
      },
    ],
  },
});
