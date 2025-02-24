import UserModel from "@/api/admin/user/userSchema";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

// Response handler function
const handleResponse = (res: Response, status: number, message: string) => {
  const serviceResponse = ServiceResponse.failure(message, null, status);
  return res.status(status).send(serviceResponse);
};

export const AuthGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Check cookies if header is not present
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken;
    }

    // If no token is found
    if (!token) {
      return handleResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Unauthorized: No token provided"
      );
    }

    // Verify token
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { _id: string; role: string };

    // Optionally check if user exists in the database
    // const user = await UserModel.findById(decodedToken._id);
    // if (!user) {
    //   return handleResponse(res, StatusCodes.UNAUTHORIZED, "Unauthorized: Invalid token");
    // }

    req.user = decodedToken;
    next();
  } catch (error: any) {
    logger.error(`AuthGuard Error: ${error.message}`);
    return handleResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Unauthorized: Invalid or expired token"
    );
  }
};
