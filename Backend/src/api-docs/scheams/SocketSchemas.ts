import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

// Send Message
export const ScoketSendMessageSchema = z.object({
  tempId: z.number(),
  sender: z.string(),
  receiver: z.string(),
  content: z.string().optional(),
  room: z.string(),
  voice: z.string().optional(),
  file: z.string().optional(),
  replyTo: z.string().optional(),
  isSending: z.boolean(),
});

export type ScoketSendMessage = z.infer<typeof ScoketSendMessageSchema>;

export const ScoketSendMessageResponseSchema = z.object({
  _id: z.string(),
  tempId: z.number(),
  content: z.string(),
  room: z.string(),
  status: z.string(),
  isSending: z.boolean(),
  voice: z.any().nullable(),
  replyTo: z
    .object({
      _id: z.string(),
      content: z.string(),
      sender: z.object({
        _id: z.string(),
        username: z.string(),
        profile: z.string(),
      }),
      file: z.any().nullable(),
      voice: z.any().nullable(),
    })
    .nullable(),
  sender: z.object({
    _id: z.string(),
    username: z.string(),
    profile: z.string(),
  }),
  recipient: z
    .object({
      _id: z.string(),
      username: z.string(),
      profile: z.string(),
    })
    .nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ScoketSendMessageResponse = z.infer<
  typeof ScoketSendMessageResponseSchema
>;
// Send Message

// Edit Message
export const SocketEditMessageSchema = z.object({
  _id: z.string(),
  tempId: z.number(),
  sender: z.string(),
  receiver: z.string(),
  content: z.string().optional(),
  room: z.string(),
  voice: z.string().optional(),
  file: z.string().optional(),
  replyTo: z.string().optional(),
  isSending: z.boolean(),
});

export type SocketEditMessage = z.infer<typeof SocketEditMessageSchema>;

export const ScoketEditMessageResponseSchema = z.object({
  _id: z.string(),
  tempId: z.number(),
  content: z.string(),
  room: z.string(),
  status: z.string(),
  isSending: z.boolean(),
  voice: z.any().nullable(),
  replyTo: z
    .object({
      _id: z.string(),
      content: z.string(),
      sender: z.object({
        _id: z.string(),
        username: z.string(),
        profile: z.string(),
      }),
      file: z.any().nullable(),
      voice: z.any().nullable(),
    })
    .nullable(),
  sender: z.object({
    _id: z.string(),
    username: z.string(),
    profile: z.string(),
  }),
  recipient: z
    .object({
      _id: z.string(),
      username: z.string(),
      profile: z.string(),
    })
    .nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ScoketEditMessageResponse = z.infer<
  typeof ScoketEditMessageResponseSchema
>;
// Edit Message

// Forward Message
export const SocketForwardMessageSchema = z.object({
  messageId: z.string(),
  receiver: z.string(),
  room: z.string(),
});

export type SocketForwardMessage = z.infer<typeof SocketForwardMessageSchema>;

export const ScoketForwardMessageResponseSchema = z.object({
  _id: z.string(),
  tempId: z.number(),
  content: z.string(),
  room: z.string(),
  status: z.string(),
  isSending: z.boolean(),
  voice: z.any().nullable(),
  replyTo: z
    .object({
      _id: z.string(),
      content: z.string(),
      sender: z.object({
        _id: z.string(),
        username: z.string(),
        profile: z.string(),
      }),
      file: z.any().nullable(),
      voice: z.any().nullable(),
    })
    .nullable(),
  sender: z.object({
    _id: z.string(),
    username: z.string(),
    profile: z.string(),
  }),
  recipient: z
    .object({
      _id: z.string(),
      username: z.string(),
      profile: z.string(),
    })
    .nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ScoketForwardMessageResponse = z.infer<
  typeof ScoketForwardMessageResponseSchema
>;
// Forward Message
