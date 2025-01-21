import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AuthGuard } from "@/common/guard/AuthGuard";
import { rolesGuard } from "@/common/guard/RoleGuard";
import { validateRequest } from "@/common/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { RoomSchema } from "./roomsModel";
import { Roles } from "@/enum/Roles";
import { roomsController } from "./roomsController";

export const roomsRegistery = new OpenAPIRegistry();
export const roomsRouter: Router = express.Router();

// Register User Schema
roomsRegistery.register("Room", RoomSchema);

roomsRegistery.registerPath({
  method: "get",
  path: "/admin/rooms",
  tags: ["Rooms - Admin Panel"],
  request: {
    query: z.object({
      page: z.string().describe("Page number"),
      limit: z.string().describe("Number of rooms per page"),
    }),
  },
  responses: createApiResponse(
    z.array(RoomSchema),
    "Successfully retrieved rooms"
  ),
});
roomsRouter.get(
  "/",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  validateRequest(
    z.object({
      query: z.object({
        page: z.string(),
        limit: z.string(),
      }),
    })
  ),
  roomsController.getAllRooms
);

roomsRegistery.registerPath({
  method: "get",
  path: "/admin/rooms/{roomId}",
  tags: ["Rooms - Admin Panel"],
  request: {
    params: z.object({
      roomId: z.string(),
    }),
  },
  responses: createApiResponse(RoomSchema, "Successfully retrieved room"),
});
roomsRouter.get(
  "/:roomId",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  roomsController.getRoomById
);
