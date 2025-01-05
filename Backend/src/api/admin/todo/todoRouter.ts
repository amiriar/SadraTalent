import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetTodoSchema, TodoSchema } from "@/api/todo/todoModel";
import { AuthGuard } from "@/common/guard/AuthGuard";
import { rolesGuard } from "@/common/guard/RoleGuard";
import { validateRequest } from "@/common/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { todoController } from "./todoController";

export const adminTodoRegistry = new OpenAPIRegistry();
export const adminTodoRouter: Router = express.Router();

// Register Todo Schema
adminTodoRegistry.register("Todo - Admin Panel", TodoSchema);

// Get all todos
adminTodoRegistry.registerPath({
  method: "get",
  path: "/admin/todos",
  tags: ["Todo - Admin Panel"],
  responses: createApiResponse(z.array(TodoSchema), "Successfully retrieved todos"),
});
adminTodoRouter.get("/", AuthGuard, rolesGuard("ADMIN"), todoController.getTodos);

// Get todo by ID
adminTodoRegistry.registerPath({
  method: "get",
  path: "/admin/todos/{id}",
  tags: ["Todo - Admin Panel"],
  request: { params: GetTodoSchema.shape.params },
  responses: createApiResponse(TodoSchema, "Successfully retrieved todo"),
});
adminTodoRouter.get("/:id", AuthGuard, rolesGuard("ADMIN"), validateRequest(GetTodoSchema), todoController.getTodo);

// // Create todo
// adminTodoRegistry.registerPath({
//   method: "post",
//   path: "/admin/todos",
//   tags: ["Todo - Admin Panel"],
//   request: {
//     body: {
//       content: {
//         "application/json": {
//           schema: TodoSchema.omit({ id: true, createdAt: true, updatedAt: true }),
//         },
//       },
//     },
//   },
//   responses: createApiResponse(TodoSchema, "Successfully created todo"),
// });
// adminTodoRouter.post("/", AuthGuard, rolesGuard("ADMIN"), todoController.createTodo);

// Update todo
adminTodoRegistry.registerPath({
  method: "put",
  path: "/admin/todos/{id}",
  tags: ["Todo - Admin Panel"],
  request: {
    params: GetTodoSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: TodoSchema.omit({ id: true, createdAt: true, updatedAt: true }),
        },
      },
    },
  },
  responses: createApiResponse(TodoSchema, "Successfully updated todo"),
});
adminTodoRouter.put("/:id", AuthGuard, rolesGuard("ADMIN"), todoController.updateTodo);

// Delete todo
adminTodoRegistry.registerPath({
  method: "delete",
  path: "/admin/todos/{id}",
  tags: ["Todo - Admin Panel"],
  request: { params: GetTodoSchema.shape.params },
  responses: createApiResponse(z.object({ success: z.boolean() }), "Successfully deleted todo"),
});
adminTodoRouter.delete("/:id", AuthGuard, rolesGuard("ADMIN"), todoController.deleteTodo);
