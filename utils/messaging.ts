import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  // getStringLength(s: string): number;
  makeRequest(s: object): object;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
