import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  role: z.string(),
  email: z.string().email(),
  lastDateIn: z.string().optional(),
  password: z.string(),
  phoneNumber: z.string().optional(),
  profile: z.string().optional(),
  bio: z.string().optional(),
  otp: z.string().optional().nullable(),
  otpExpire: z.date().optional().nullable(),
  status: z.string().optional(),
  lastSeen: z.date(),
  stories: z.string().optional().nullable(),
  refreshToken: z.string(),
  customStatus: z.string(),
  age: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});
