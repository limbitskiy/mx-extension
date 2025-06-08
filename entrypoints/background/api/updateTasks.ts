import { makeRequest } from "./index";

interface UpdateTasksProps {
  html: string;
  url: string;
  id: string;
}

export const updateTasks = async (data: UpdateTasksProps) => {
  const payload = {
    key: "ext_update_tasks",
    data,
  };

  await makeRequest(payload);
};
