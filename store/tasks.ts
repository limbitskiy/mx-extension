import { Task } from "@/types";

export const taskStore = storage.defineItem<Task[]>("local:tasks", {
  fallback: [],
});
