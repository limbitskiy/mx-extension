import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  makeRequest(payload: RequestData): ResponseData | { error: unknown };
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
