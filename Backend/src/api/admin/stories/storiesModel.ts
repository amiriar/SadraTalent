import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const StorySchema = z.object({
  description: z.string().max(2000).optional(),
  file: z.string().optional(),
  thumbnail: z.string().optional(),
  hyperLink: z.string().optional(),
  user: z.string().nonempty(),
  isDeleted: z.boolean().default(false),
  isAccepted: z.boolean().default(true),
  expireAt: z.date(),
  seenBy: z.array(z.string()).default([]),
  likes: z
    .array(
      z.union([
        z.string(),
        z.object({
          _id: z.string(),
          username: z.string().nonempty(),
          profile: z.string().optional(),
        }),
      ])
    )
    .default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Story = z.infer<typeof StorySchema>;
