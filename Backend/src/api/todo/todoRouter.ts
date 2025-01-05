import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetTodoSchema, TodoSchema } from "@/api/todo/todoModel";
import { AuthGuard } from "@/common/guard/AuthGuard";
import { rolesGuard } from "@/common/guard/RoleGuard";
import { validateRequest } from "@/common/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { todoController } from "./todoController";

export const todoRegistry = new OpenAPIRegistry();
export const todoRouter: Router = express.Router();

// Register Todo Schema
todoRegistry.register("Todo", TodoSchema);

// Get all todos
todoRegistry.registerPath({
  method: "get",
  path: "/todos",
  tags: ["Todo"],
  responses: createApiResponse(z.array(TodoSchema), "Successfully retrieved todos"),
});
todoRouter.get("/", AuthGuard, rolesGuard("USER"), todoController.getTodos);

// Get todo by ID
todoRegistry.registerPath({
  method: "get",
  path: "/todos/{id}",
  tags: ["Todo"],
  request: { params: GetTodoSchema.shape.params },
  responses: createApiResponse(TodoSchema, "Successfully retrieved todo"),
});
todoRouter.get("/:id", AuthGuard, rolesGuard("USER"), validateRequest(GetTodoSchema), todoController.getTodo);

// Create todo
todoRegistry.registerPath({
  method: "post",
  path: "/todos",
  tags: ["Todo"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: TodoSchema.omit({ id: true, createdAt: true, updatedAt: true }),
        },
      },
    },
  },
  responses: createApiResponse(TodoSchema, "Successfully created todo"),
});
todoRouter.post("/", AuthGuard, rolesGuard("USER"), todoController.createTodo);

// Update todo
todoRegistry.registerPath({
  method: "put",
  path: "/todos/{id}",
  tags: ["Todo"],
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
todoRouter.put("/:id", AuthGuard, rolesGuard("USER"), todoController.updateTodo);

// Delete todo
todoRegistry.registerPath({
  method: "delete",
  path: "/todos/{id}",
  tags: ["Todo"],
  request: { params: GetTodoSchema.shape.params },
  responses: createApiResponse(z.object({ success: z.boolean() }), "Successfully deleted todo"),
});
todoRouter.delete("/:id", AuthGuard, rolesGuard("USER"), todoController.deleteTodo);
