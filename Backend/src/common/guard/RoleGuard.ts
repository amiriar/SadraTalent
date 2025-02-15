import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function rolesGuard(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user?.role /*|| !Array.isArray(user?.role)*/) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Access denied: User not authenticated or roles not defined.",
      });
    }

    if (!user.role.includes(requiredRole)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Access denied: Insufficient role." });
    }

    next();
  };
}
