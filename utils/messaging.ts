import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  makeRequest(payload: RequestData): ResponseData | { error: unknown };
  openHref(data: { href: string }): void;
  sendParsedPage(data: { url: string; html: string }): void;
  requestTabId(string: string): number | undefined;
  isParserTab(string: string): boolean;
  reloadParserTab(): void;
  register(): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
