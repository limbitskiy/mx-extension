import { matchesStore } from "@/store/matches";

export const isMatch = async (url: string) => {
  const allowedUrls = await matchesStore.getValue();
  return allowedUrls?.some((allowedUrl) => new RegExp(allowedUrl).test(url));
};
