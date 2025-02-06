import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AuthGuard } from "@/common/guard/AuthGuard";
import { validateRequest } from "@/common/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { storiesController } from "./storiesController";
import { StorySchema, UpdateStorySchema } from "../admin/stories/storiesModel";

export const storiesRegistery = new OpenAPIRegistry();
export const storiesRouter: Router = express.Router();

storiesRegistery.register("Story", StorySchema);
storiesRegistery.register("UpdateStory", UpdateStorySchema);
storiesRegistery.registerPath({
  method: "get",
  path: "/stories",
  tags: ["Stories"],
  request: {
    query: z.object({
      page: z.string().describe("Page number"),
      limit: z.string().describe("Number of stories per page"),
      isDeleted: z.boolean(),
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
  validateRequest(
    z.object({
      query: z.object({
        page: z.string(),
        limit: z.string(),
        isDeleted: z.string().transform((val) => val === "true"),
      }),
    })
  ),
  storiesController.getAllStories
);

storiesRegistery.registerPath({
  method: "get",
  path: "/stories/{storyId}",
  tags: ["Stories"],
  request: {
    params: z.object({
      storyId: z.string().describe("Story ID"),
    }),
  },
  responses: createApiResponse(StorySchema, "Successfully retrieved story"),
});
storiesRouter.get("/:storyId", AuthGuard, storiesController.getStoriesById);

storiesRegistery.registerPath({
  method: "delete",
  path: "/stories/{storyId}",
  tags: ["Stories"],
  request: {
    params: z.object({
      storyId: z.string().describe("Story ID"),
    }),
  },
  responses: createApiResponse(StorySchema, "Successfully deleted story"),
});
storiesRouter.delete("/:storyId", AuthGuard, storiesController.deleteStoryById);

storiesRegistery.registerPath({
  method: "patch",
  path: "/stories/{storyId}",
  tags: ["Stories"],
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

storiesRouter.patch(
  "/:storyId",
  AuthGuard,
  validateRequest(
    z.object({
      body: UpdateStorySchema,
    })
  ),
  storiesController.updateStoryById
);
