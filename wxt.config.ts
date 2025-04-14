import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    permissions: ["storage", "alarms", "tabs", "scripting", "activeTab"],
    action: {},
    web_accessible_resources: [
      {
        matches: ["<all_urls>"],
        resources: ["new-tab-script.js"],
      },
    ],
  },
});
