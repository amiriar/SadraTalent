import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AuthGuard } from "@/common/guard/AuthGuard";
import { validateRequest } from "@/common/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { UploadSchema } from "./uploadsModel";
import { uploadController } from "./uploadsController";
import { uploadFile } from "@/common/utils/multer";

export const uploadsRegistery = new OpenAPIRegistry();
export const uploadsRouter: Router = express.Router();

uploadsRegistery.register("Upload", UploadSchema);

uploadsRegistery.registerPath({
  method: "post",
  path: "/upload/file",
  tags: ["Uploads"],
  requestBody: {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            file: {
              type: "string",
              format: "binary",
              description: "The file to upload",
            },
          },
        },
      },
    },
  },
  responses: createApiResponse(UploadSchema, "Successfully retrieved uploads"),
});
uploadsRouter.post(
  "/file",
  AuthGuard,
  uploadFile.single("file"),
  uploadController.uploadFile
);

uploadsRegistery.registerPath({
  method: "post",
  path: "/upload/voice",
  tags: ["Uploads"],
  requestBody: {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            file: {
              type: "string",
              format: "binary",
              description: "The voice to upload",
            },
          },
        },
      },
    },
  },
  responses: createApiResponse(UploadSchema, "Successfully retrieved uploads"),
});
uploadsRouter.post(
  "/voice",
  AuthGuard,
  uploadFile.single("voiceMessage"),
  uploadController.uploadVoice
);

uploadsRegistery.registerPath({
  method: "post",
  path: "/upload/story",
  tags: ["Uploads"],
  requestBody: {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            file: {
              type: "string",
              format: "binary",
              description: "The story file to upload",
            },
          },
        },
      },
    },
  },
  responses: createApiResponse(UploadSchema, "Successfully retrieved uploads"),
});
uploadsRouter.post(
  "/story",
  AuthGuard,
  uploadFile.single("story"),
  uploadController.uploadStory
);

uploadsRegistery.registerPath({
  method: "post",
  path: "/upload/thumbnail",
  tags: ["Uploads"],
  requestBody: {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            file: {
              type: "string",
              format: "binary",
              description: "The story thumbnail to upload",
            },
          },
        },
      },
    },
  },
  responses: createApiResponse(UploadSchema, "Successfully retrieved uploads"),
});
uploadsRouter.post(
  "/thumbnail",
  AuthGuard,
  uploadFile.single("thumbnail"),
  uploadController.uploadThumbnail
);
