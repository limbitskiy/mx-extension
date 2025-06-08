import { makeRequest } from "./index";

interface AddLinkProps {
  html: string;
  url: string;
  title: string;
}

export const addLink = async (data: AddLinkProps) => {
  const payload = {
    key: "ext_add_item",
    data,
  };

  return await makeRequest(payload);
};
