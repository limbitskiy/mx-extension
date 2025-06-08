export const sendRequest = async (payload: unknown) => {
  const response = await browser.runtime.sendMessage({ type: "makeRequest", payload });

  if ("error" in response) {
    return new Error(response.error);
  }

  return response;
};
