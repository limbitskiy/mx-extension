interface SettingsStore {
  registered: boolean;
  welcomePopup: boolean;
}

export const settingsStore = storage.defineItem<SettingsStore>("local:settings", {
  init: () => ({
    registered: false,
    welcomePopup: true,
  }),
});

export const changeSetting = async (setting: {}) => {
  const store = await settingsStore.getValue();
  const updatedStore = { ...store, ...setting };

  await settingsStore.setValue(updatedStore);
  return updatedStore;
};
