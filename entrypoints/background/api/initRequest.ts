import { makeRequest } from "./index";

export const initRequest = async () => {
  const payload = {
    key: "ext_init",
    data: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      browser_language: navigator.language,
    },
  };

  await makeRequest(payload);
};
