import { Task } from "@/types";
import { taskStore } from "@/store";
import { QueueController } from "./QueueController";

const debugMode = import.meta.env.WXT_DEBUG;

export const handleNewTasks = async (newTasks: Task[]) => {
  const localTasks = await taskStore.getValue();
  const changedTasks: Task[] = [];

  newTasks.forEach((newTask) => {
    const localTask = localTasks.find((localTask) => localTask.id === newTask.id);

    if (localTask) {
      if (localTask.period != newTask.period) {
        localTask.period = newTask.period;
      }
      changedTasks.push(localTask);
    } else {
      changedTasks.push({ ...newTask, updateIn: newTask.period });
    }
  });

  await taskStore.setValue(changedTasks);

  return changedTasks;
};

export const checkTasks = async (intervalInMin: number, queueController: QueueController) => {
  console.log(`checking tasks`);

  const tasks = await taskStore.getValue();
  const updatedTasks: Task[] = [];

  if (debugMode) {
    tasks.forEach(async (task) => {
      queueController.add(task);
      updatedTasks.push(task);
    });
  } else {
    tasks.forEach(async (task) => {
      task.updateIn! -= intervalInMin * 60000;

      if (task.updateIn! <= 0) {
        queueController.add(task);
        task.updateIn = task.period;
      }

      updatedTasks.push(task);
    });
  }

  await taskStore.setValue(updatedTasks);

  return updatedTasks;
};
