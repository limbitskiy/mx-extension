export async function addItem() {
  const payload = {
    key: "ext_add_item",
    data: {
      url: location?.href,
      html: document.body.innerHTML,
      title: document.title,
    },
  };

  return await sendRequest(payload);
}

export async function deleteItem(itemId: string) {
  const payload = {
    key: "ext_delete_item",
    data: {
      itemId,
    },
  };

  return await sendRequest(payload);
}

export async function deleteFolder(folderId: string) {
  const payload = {
    key: "ext_delete_folder",
    data: {
      folderId,
    },
  };

  return await sendRequest(payload);
}

export async function saveSettings(data: {}) {
  const payload = {
    key: "ext_set_profile",
    data,
  };

  return await sendRequest(payload);
}

export async function getItems() {
  const payload = {
    key: "ext_get_items",
  };

  return await sendRequest(payload);
}

export async function getIcon() {
  const payload = {
    key: "ext_get_icon",
    data: {
      url: location?.href,
    },
  };

  return await sendRequest(payload);
}

export async function requestTabId() {
  return await sendMessage("requestTabId", "requestTabId");
}

export async function isParserTab() {
  return await sendMessage("isParserTab", "isParserTab");
}

async function sendRequest(payload: RequestData) {
  const response = await sendMessage("makeRequest", payload);

  if ("error" in response) {
    console.error("Ошибка:", response.error);
  } else {
    return response;
  }
}
