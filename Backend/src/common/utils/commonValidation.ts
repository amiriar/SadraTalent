import { z } from "zod";

export const commonValidations = {
  id: z.string().refine((data) => /^[a-fA-F0-9]{24}$/.test(data), "ID must be a valid MongoDB ObjectId"),
  // username: z.string(),
  // email: z.string().email("Invalid email address"),
  // password: z.string().min(8, "Password must be at least 8 characters long"),
  // usernameOrEmail: z.string(),
};
