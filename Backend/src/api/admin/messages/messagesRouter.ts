import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AuthGuard } from "@/common/guard/AuthGuard";
import { rolesGuard } from "@/common/guard/RoleGuard";
import { validateRequest } from "@/common/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { messageController } from "./messagesController";
import { MessageSchema } from "./messagesModel";
import { Roles } from "@/enum/Roles";

export const messageRegistery = new OpenAPIRegistry();
export const messageRouter: Router = express.Router();

// Register User Schema
messageRegistery.register("Message", MessageSchema);

messageRegistery.registerPath({
  method: "get",
  path: "/admin/messages/{MongoSenderId}/{MongoReceiverId}",
  tags: ["Messages - Admin Panel"],
  request: {
    params: z.object({
      MongoSenderId: z.string(),
      MongoReceiverId: z.string(),
    }),
    query: z.object({
      page: z.string().describe("Page number"),
      limit: z.string().describe("Number of messages per page"),
    }),
  },
  responses: createApiResponse(
    z.array(MessageSchema),
    "Successfully retrieved messages"
  ),
});
messageRouter.get(
  "/:MongoSenderId/:MongoReceiverId",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  validateRequest(
    z.object({
      params: z.object({
        MongoSenderId: z.string(),
        MongoReceiverId: z.string(),
      }),
      query: z.object({
        page: z.string(),
        limit: z.string(),
      }),
    })
  ),
  messageController.getMessagesBetweenUsersByMongoId
);

messageRegistery.registerPath({
  method: "get",
  path: "/admin/messages/{messageId}",
  tags: ["Messages - Admin Panel"],
  request: {
    params: z.object({
      messageId: z.string(),
    }),
    query: z.object({
      page: z.string().describe("Page number"),
      limit: z.string().describe("Number of messages per page"),
    }),
  },
  responses: createApiResponse(
    z.array(MessageSchema),
    "Successfully retrieved messages"
  ),
});
messageRouter.get(
  "/:messageId",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  validateRequest(
    z.object({
      params: z.object({
        messageId: z.string(),
      }),
      query: z.object({
        page: z.string(),
        limit: z.string(),
      }),
    })
  ),
  messageController.getMessagesBetweenUsersByMongoId
);

messageRegistery.registerPath({
  method: "get",
  path: "/admin/messages/search",
  tags: ["Messages - Admin Panel"],
  request: {
    query: z.object({
      word: z.string().describe("Word or phrase to search for in messages"),
      page: z.string().describe("Page number"),
      limit: z.string().describe("Number of messages per page"),
    }),
  },
  responses: createApiResponse(
    z.array(MessageSchema),
    "Successfully retrieved messages containing search term"
  ),
});
messageRouter.get(
  "/search",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  validateRequest(
    z.object({
      query: z.object({
        word: z.string(),
        page: z.string(),
        limit: z.string(),
      }),
    })
  ),
  messageController.searchMessages
);

messageRegistery.registerPath({
  method: "delete",
  path: "/admin/messages/{messageId}",
  tags: ["Messages - Admin Panel"],
  request: {
    params: z.object({
      messageId: z.string(),
    }),
  },
  responses: createApiResponse(
    z.string().transform(Boolean),
    "Successfully retrieved messages"
  ),
});
messageRouter.delete(
  "/:messageId",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  validateRequest(
    z.object({
      params: z.object({
        messageId: z.string(),
      }),
    })
  ),
  messageController.deleteMessageById
);
