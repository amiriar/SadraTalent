import UserModel from "@/api/admin/user/userSchema";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

// Updated response handler function using ServiceResponse
const handleResponse = (res: Response, status: number, message: string) => {
  const serviceResponse = ServiceResponse.failure(message, null, status);
  return res.status(status).send(serviceResponse);
};

export const AuthGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return handleResponse(res, StatusCodes.UNAUTHORIZED, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string };

    // Find user from token payload
    const user = await UserModel.findById(decodedToken._id);
    if (!user) {
      return handleResponse(res, StatusCodes.UNAUTHORIZED, "Unauthorized: Invalid token");
    }

    // Attach user to the request
    req.user = user;
    next();
  } catch (error: any) {
    logger.error(`AuthGuard Error: ${error.message}`);
    return handleResponse(res, StatusCodes.UNAUTHORIZED, "Unauthorized: Invalid or expired token");
  }
};
