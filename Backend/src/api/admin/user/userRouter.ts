import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetUserSchema, UserSchema } from "@/api/admin/user/userModel";
import { AuthGuard } from "@/common/guard/AuthGuard";
import { rolesGuard } from "@/common/guard/RoleGuard";
import { validateRequest } from "@/common/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

// Register User Schema
userRegistry.register("User", UserSchema);

// Get all users
userRegistry.registerPath({
  method: "get",
  path: "/users",
  tags: ["User - Admin Panel"],
  responses: createApiResponse(z.array(UserSchema), "Successfully retrieved users"),
});
userRouter.get("/", AuthGuard, rolesGuard("ADMIN"), userController.getUsers);

// Get user by ID
userRegistry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: ["User - Admin Panel"],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, "Successfully retrieved user"),
});
userRouter.get("/:id", validateRequest(GetUserSchema), AuthGuard, rolesGuard("ADMIN"), userController.getUser);

// Create user
// userRegistry.registerPath({
//   method: "post",
//   path: "/users",
//   tags: ["User - Admin Panel"],
//   request: {
//     body: {
//       content: {
//         "application/json": {
//           schema: UserSchema.omit({ id: true, createdAt: true, updatedAt: true }),
//         },
//       },
//     },
//   },
//   responses: createApiResponse(UserSchema, "Successfully created user"),
// });
// userRouter.post("/", userController.createUser);

// Update user
userRegistry.registerPath({
  method: "put",
  path: "/users/{id}",
  tags: ["User - Admin Panel"],
  request: {
    params: GetUserSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: UserSchema.omit({ id: true, createdAt: true, updatedAt: true }),
        },
      },
    },
  },
  responses: createApiResponse(UserSchema, "Successfully updated user"),
});
userRouter.put("/:id", AuthGuard, rolesGuard("ADMIN"), userController.updateUser);

// Delete user
userRegistry.registerPath({
  method: "delete",
  path: "/users/{id}",
  tags: ["User - Admin Panel"],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(z.object({ success: z.boolean() }), "Successfully deleted user"),
});
userRouter.delete("/:id", AuthGuard, rolesGuard("ADMIN"), userController.deleteUser);
