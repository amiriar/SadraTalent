import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AuthGuard } from "@/common/guard/AuthGuard";
import { rolesGuard } from "@/common/guard/RoleGuard";
import { validateRequest } from "@/common/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { StorySchema, UpdateStorySchema } from "./storiesModel";
import { Roles } from "@/enum/Roles";
import { adminStoriesController } from "./storiesController";

export const adminStoriesRegistery = new OpenAPIRegistry();
export const adminStoriesRouter: Router = express.Router();

adminStoriesRegistery.register("Story", StorySchema);
adminStoriesRegistery.register("UpdateStory", UpdateStorySchema);

adminStoriesRegistery.registerPath({
  method: "get",
  path: "/admin/stories",
  tags: ["Stories - Admin Panel"],
  request: {
    params: z.object({
      page: z.string().describe("Page number"),
      limit: z.string().describe("Number of stories per page"),
      isDeleted: z
        .string()
        .transform((val) => val === "true")
        .describe("get the deleted stories"),
    }),
  },
  responses: createApiResponse(
    z.array(StorySchema),
    "Successfully retrieved stories"
  ),
});
adminStoriesRouter.get(
  "/",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  validateRequest(
    z.object({
      params: z.object({
        page: z.string(),
        limit: z.string(),
        isDeleted: z.boolean(),
      }),
    })
  ),
  adminStoriesController.getAllStories
);

adminStoriesRegistery.registerPath({
  method: "get",
  path: "/admin/stories/{storyId}",
  tags: ["Stories - Admin Panel"],
  request: {
    params: z.object({
      storyId: z.string().describe("Story ID"),
    }),
  },
  responses: createApiResponse(StorySchema, "Successfully retrieved story"),
});
adminStoriesRouter.get(
  "/:storyId",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  adminStoriesController.getStoriesById
);

adminStoriesRegistery.registerPath({
  method: "delete",
  path: "/admin/stories/{storyId}",
  tags: ["Stories - Admin Panel"],
  request: {
    params: z.object({
      storyId: z.string().describe("Story ID"),
    }),
  },
  responses: createApiResponse(StorySchema, "Successfully deleted story"),
});
adminStoriesRouter.delete(
  "/:storyId",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  adminStoriesController.deleteStoryById
);

adminStoriesRegistery.registerPath({
  method: "patch",
  path: "/admin/stories/{storyId}",
  tags: ["Stories - Admin Panel"],
  request: {
    params: z.object({
      storyId: z.string().describe("Story ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateStorySchema.omit({
            // id: true,
            // createdAt: true,
            // updatedAt: true,
          }),
        },
      },
    },
  },
  responses: createApiResponse(StorySchema, "Successfully updated story"),
});

adminStoriesRouter.patch(
  "/:storyId",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  validateRequest(
    z.object({
      body: UpdateStorySchema,
    })
  ),
  adminStoriesController.updateStoryById
);
