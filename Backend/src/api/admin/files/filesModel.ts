import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ParticipantSchema = z.object({
  user: z.string(),
  role: z.enum(["member", "admin", "owner"]).default("member"),
  nickname: z.string().max(20).optional()
});

export type Participant = z.infer<typeof ParticipantSchema>;

export const RoomSchema = z.object({
  profile: z.string().optional(),
  name: z.string().max(20),
  bio: z.string().max(200).optional(),
  pinnedMessages: z.array(z.string()).optional().nullable(),
  participants: z.array(ParticipantSchema),
  isGroup: z.boolean(),
  isPublic: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Room = z.infer<typeof RoomSchema>;
