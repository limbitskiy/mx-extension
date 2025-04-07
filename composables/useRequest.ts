export default function () {
  async function sendRequest(payload: RequestData) {
    const response = await sendMessage("makeRequest", payload);

    if ("error" in response) {
      console.error("Ошибка:", response.error);
    } else {
      return response;
    }
  }

  return {
    sendRequest,
  };
}
