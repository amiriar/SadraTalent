import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { adminTodoRegistry } from "@/api/admin/todo/todoRouter";
import { userRegistry } from "@/api/admin/user/userRouter";
import { authRegistry } from "@/api/auth/authRouter";
import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import { todoRegistry } from "@/api/todo/todoRouter";

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([
    healthCheckRegistry,
    userRegistry,
    todoRegistry,
    authRegistry,
    adminTodoRegistry,
  ]);

  // Define the BearerAuth scheme in the registry
  registry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Todo Swagger API",
      description: "Sadra Talent Chat Api Made By Amirreza Abdolrahimi Using Express.",
    },
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/swagger.json",
    },
    security: [{ BearerAuth: [] }], // Apply BearerAuth globally
  });
}
