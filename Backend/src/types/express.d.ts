import type { IUser } from "@/api/admin/user/userSchema";
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      // user?: IUser;
      user?: { _id: string; role?: string };
    }
  }
}
