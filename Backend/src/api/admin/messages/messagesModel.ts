import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const UserInfoSchema = z.object({
  _id: z.string(),
  username: z.string(),
  profile: z.string(),
  phone: z.string(),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;

export const MessageSchema = z.object({
  sender: UserInfoSchema,
  receiver: UserInfoSchema,
  content: z.string().optional(),
  room: z.string(),
  date: z.string().optional(),
  status: z.enum(["sent", "delivered", "seen"]).default("sent"),
  voice: z.string().optional(),
  file: z.string().optional(),
  isPinned: z.boolean().default(false),
  isEdited: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  isForwarded: z.boolean().default(false),
  isDeletedForMe: z.boolean().default(false),
  replyTo: z.string().optional(),
  forwardedFrom: z.string().optional(),
  deletedBy: z.array(z.string()).default([]),
  storyId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Message = z.infer<typeof MessageSchema>;
