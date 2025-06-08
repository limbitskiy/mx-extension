import { sendRequest } from "./index";

interface AddItemProps {
  url: string;
  html: string;
  title: string;
}

export const addItem = async (data: AddItemProps) => {
  const payload = {
    key: "ext_add_item",
    data,
  };

  return await sendRequest(payload);
};
