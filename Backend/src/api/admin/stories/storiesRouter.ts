import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AuthGuard } from "@/common/guard/AuthGuard";
import { rolesGuard } from "@/common/guard/RoleGuard";
import { validateRequest } from "@/common/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { StorySchema } from "./storiesModel";
import { Roles } from "@/enum/Roles";
import { storiesController } from "./storiesController";

export const storiesRegistery = new OpenAPIRegistry();
export const storiesRouter: Router = express.Router();

storiesRegistery.register("Story", StorySchema);

storiesRegistery.registerPath({
  method: "get",
  path: "/admin/stories",
  tags: ["Stories - Admin Panel"],
  request: {
    query: z.object({
      page: z.string().describe("Page number"),
      limit: z.string().describe("Number of stories per page"),
    }),
  },
  responses: createApiResponse(
    z.array(StorySchema),
    "Successfully retrieved stories"
  ),
});
storiesRouter.get(
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
  storiesController.getAllStories
);

storiesRegistery.registerPath({
  method: "get",
  path: "/admin/stories/{id}",
  tags: ["Stories - Admin Panel"],
  responses: createApiResponse(StorySchema, "Successfully retrieved story"),
});
storiesRouter.get(
  "/:id",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  storiesController.getStoriesById
);
