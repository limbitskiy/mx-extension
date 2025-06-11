import { Folder, Locale, Task } from "@/types";
import axios from "axios";
import { handleNewTasks } from "../tasks";

interface RequestData {
  data?: object;
  service?: object;
  key: string;
}

interface ResponseData {
  folders: Folder[];
  tasks: Task[];
  locale: Locale[];
  url_icon: string[];
  message?: string;
}

const apiUrl = import.meta.env.WXT_API_URL;

export const makeRequest = async (requestBody: RequestData): Promise<ResponseData | { error: unknown }> => {
  try {
    const localService = await storage.getItem("local:service");

    if (localService) {
      requestBody.service = localService;
    }

    const response = await axios.post<{ service: object; data: ResponseData }>(apiUrl, requestBody);

    const { service, data } = response.data;

    if (!data) return { error: "no data" };

    if (service) {
      await storage.setItem("local:service", service);
    }

    if ("folders" in data) {
      await storage.setItem("local:folders", data.folders);
    }

    if ("tasks" in data) {
      await handleNewTasks(data.tasks);
    }

    if ("locale" in data) {
      await storage.setItem("local:locale", data.locale);
    }

    if ("url_icon" in data) {
      await storage.setItem("local:url_icon", data.url_icon);
    }

    if ("region" in data) {
      const settings = await storage.getItem("local:settings");
      await storage.setItem("local:settings", { ...(settings as {}), region: data.region });
    }

    if ("contactUrl" in data) {
      const settings = await storage.getItem("local:settings");
      await storage.setItem("local:settings", { ...(settings as {}), contactUrl: data.contactUrl });
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error?.message);
    } else {
      throw new Error("Something went wrong in makeRequest");
    }
  }
};
