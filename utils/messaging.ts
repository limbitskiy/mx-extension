import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  makeRequest(payload: RequestData): ResponseData | { error: unknown };
  openDialog(string: string): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
