import { MessageSchema } from "@/api/admin/messages/messagesModel";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  ScoketEditMessageResponseSchema,
  ScoketForwardMessageResponseSchema,
  ScoketSendMessageResponseSchema,
  ScoketSendMessageSchema,
  SocketEditMessageSchema,
  SocketForwardMessageSchema,
} from "./scheams/SocketSchemas";

export const socketRegistry = new OpenAPIRegistry();

socketRegistry.registerPath({
  method: "post",
  path: "/messages:sendMessage",
  summary: "Send a message",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ScoketSendMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Message successfully sent",
      content: {
        "application/json": {
          schema: ScoketSendMessageResponseSchema,
        },
      },
    },
  },
});

socketRegistry.registerPath({
  method: "post",
  path: "/messages:editMessage",
  summary: "Edit a message",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SocketEditMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Message successfully edited",
      content: {
        "application/json": {
          schema: ScoketEditMessageResponseSchema,
        },
      },
    },
  },
});

socketRegistry.registerPath({
  method: "post",
  path: "/messages:forwardMessage",
  summary: "Forward a message",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SocketForwardMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Message successfully sent",
      content: {
        "application/json": {
          schema: ScoketForwardMessageResponseSchema,
        },
      },
    },
  },
});
