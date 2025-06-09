import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Price extension",
    permissions: ["storage", "alarms", "activeTab", "scripting"],
    action: {},
    host_permissions: ["<all_urls>"],
    web_accessible_resources: [
      {
        resources: ["content-injector.js"],
        matches: ["<all_urls>"],
      },
      {
        resources: ["htmlGetter.js"],
        matches: ["<all_urls>"],
      },
    ],
  },
});
