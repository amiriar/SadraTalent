import { z } from "zod";

export const DashboardSchema = z.object({
  username: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  bio: z.string().optional(),
  customStatus: z.string().optional(),
  email: z.string().email("Invalid email format"),
  profile: z.string().optional(),
});
