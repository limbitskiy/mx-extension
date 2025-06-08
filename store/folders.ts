import { Folder } from "@/types";

export const folderStore = storage.defineItem<Folder[]>("local:folders", {
  fallback: [],
});
