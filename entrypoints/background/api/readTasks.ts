import { makeRequest } from "./index";

export const readTasks = async () => {
  const payload = {
    key: "ext_read_tasks",
  };

  return await makeRequest(payload);
};
