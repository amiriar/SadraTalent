import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Todo = z.infer<typeof TodoSchema>;
export const TodoSchema = z.object({
  id: z.string(),
  content: z.string(),
  completed: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  dueDate: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  tags: z.array(z.string()),
  order: z.number(),
});

// Input Validation for 'GET todos/:id' endpoint
export const GetTodoSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});
