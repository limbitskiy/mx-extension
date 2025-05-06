import { ref, computed, onMounted, onUnmounted } from "vue";
import { storage, StorageItemKey } from "wxt/storage";

type StorageItemKey = string;

const isExtensionAlive = () => typeof chrome !== "undefined" && !!chrome.runtime?.id;

function safeGet<T>(key: StorageItemKey): Promise<T | null> {
  return new Promise((resolve) => {
    if (!isExtensionAlive()) return resolve(null);

    chrome.storage.local.get([key], (result) => {
      resolve(result[key] ?? null);
    });
  });
}

function safeSet<T>(key: StorageItemKey, value: T): void {
  if (!isExtensionAlive()) return;

  try {
    chrome.storage.local.set({ [key]: value });
  } catch (e) {
    console.warn(`[storage] Failed to set ${key}`, e);
  }
}

function watchStorage<T>(key: StorageItemKey, callback: (value: T | null) => void): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
    if (area !== "local" || !changes[key]) return;
    callback(changes[key].newValue ?? null);
  };

  if (isExtensionAlive()) {
    chrome.storage.onChanged.addListener(listener);
  }

  return () => {
    if (isExtensionAlive()) {
      chrome.storage.onChanged.removeListener(listener);
    }
  };
}

export function useStorageItem<T>(key: StorageItemKey, initialValue?: T) {
  const state = ref<T | null>(initialValue ?? null);
  let unwatch: (() => void) | undefined;

  const load = async () => {
    const value = await safeGet<T>(key);
    state.value = value ?? initialValue ?? null;
  };

  onMounted(async () => {
    await load();
    unwatch = watchStorage<T>(key, (value) => {
      state.value = value ?? initialValue ?? null;
    });
  });

  onUnmounted(() => {
    unwatch?.();
  });

  return computed<T>({
    get() {
      return state.value as T;
    },
    set(newValue: T) {
      state.value = newValue;
      safeSet<T>(key, newValue);
    },
  });
}
