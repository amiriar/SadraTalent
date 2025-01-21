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
      senderId: z.string(),
      receiverId: z.string(),
    }),
    query: z.object({
      page: z.number().int().positive().describe("Page number"),
      limit: z
        .number()
        .int()
        .positive()
        .describe("Number of messages per page"),
    }),
  },
  responses: createApiResponse(
    z.array(MessageSchema),
    "Successfully retrieved messages"
  ),
});
messageRouter.get(
  "/:senderId/:receiverId",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  validateRequest(
    z.object({
      params: z.object({
        senderId: z.string(),
        receiverId: z.string(),
      }),
      query: z.object({
        page: z.number().int().positive(),
        limit: z.number().int().positive(),
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
