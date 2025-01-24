import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AuthGuard } from "@/common/guard/AuthGuard";
import { rolesGuard } from "@/common/guard/RoleGuard";
import { validateRequest } from "@/common/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { Roles } from "@/enum/Roles";
import { UploadSchema } from "@/api/uploads/uploadsModel";
import { filesController } from "./filesController";

export const filesRegistery = new OpenAPIRegistry();
export const filesRouter: Router = express.Router();

// Register User Schema
filesRegistery.register("File", UploadSchema);

filesRegistery.registerPath({
  method: "get",
  path: "/admin/files",
  tags: ["Files - Admin Panel"],
  request: {
    query: z.object({
      page: z.string().describe("Page number"),
      limit: z.string().describe("Number of rooms per page"),
    }),
  },
  responses: createApiResponse(
    z.array(UploadSchema),
    "Successfully retrieved rooms"
  ),
});
filesRouter.get(
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
  filesController.getAllFiles
);

filesRegistery.registerPath({
  method: "get",
  path: "/admin/files/{fileId}",
  tags: ["Files - Admin Panel"],
  request: {
    params: z.object({
      fileId: z.string(),
    }),
  },
  responses: createApiResponse(UploadSchema, "Successfully retrieved room"),
});
filesRouter.get(
  "/:fileId",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  filesController.getFileById
);

filesRegistery.registerPath({
  method: "patch",
  path: "/admin/files/{fileId}",
  tags: ["Files - Admin Panel"],
  request: {
    params: z.object({
      fileId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UploadSchema,
        },
      },
    },
  },
  responses: createApiResponse(UploadSchema, "Successfully retrieved room"),
});
filesRouter.patch(
  "/:fileId",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  filesController.updateFileById
);

filesRegistery.registerPath({
  method: "delete",
  path: "/admin/files/{fileId}",
  tags: ["Files - Admin Panel"],
  request: {
    params: z.object({
      fileId: z.string(),
    }),
  },
  responses: createApiResponse(UploadSchema, "Successfully retrieved room"),
});
filesRouter.delete(
  "/:fileId",
  AuthGuard,
  rolesGuard(Roles.SuperAdmin),
  filesController.deleteFileById
);
