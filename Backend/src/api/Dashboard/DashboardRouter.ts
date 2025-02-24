import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AuthGuard } from "@/common/guard/AuthGuard";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { dashboardController } from "./DashboardController";
import { DashboardSchema } from "./DashboardSchema";

export const dashboardRegistery = new OpenAPIRegistry();
export const dashboardRouter: Router = express.Router();

const DashboardResponseSchema = z.object({
  user: z.string(),
});

dashboardRegistery.registerPath({
  method: "get",
  path: "/dashboard/whoami",
  tags: ["Dashboard"],
  responses: createApiResponse(
    DashboardResponseSchema,
    "Successfully logged in"
  ),
});
dashboardRouter.get("/whoami", AuthGuard, dashboardController.whoami);

dashboardRegistery.registerPath({
  method: "post",
  path: "/dashboard/",
  tags: ["Dashboard"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DashboardSchema,
        },
      },
    },
  },
  responses: createApiResponse(DashboardSchema, "Successfully logged in"),
});
dashboardRouter.post("/", AuthGuard, dashboardController.updateDashboard);
