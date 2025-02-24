import { authService } from "@/api/auth/authService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";
import { UserRepository } from "../admin/user/userRepository";
import UserModel, { IUser } from "../admin/user/userSchema";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { DashboardSchema } from "./DashboardSchema";

class DashboardController {
  public whoami: RequestHandler = async (req: Request, res: Response) => {
    const user = await UserModel.findById(req.user?._id ?? "").select(
      "-__v -stories -status -password -otp -otpExpire -refreshTokenExpires -refreshToken -lastSeen"
    );
    const serviceResponse = ServiceResponse.success(
      "User Recived.",
      user,
      StatusCodes.OK
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public updateDashboard: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const userId = (req.user as IUser)._id;
    const validatedData = DashboardSchema.parse(req.body);

    await UserModel.findOneAndUpdate({ _id: userId }, validatedData);

    const serviceResponse = ServiceResponse.success(
      "User Updated.",
      true,
      StatusCodes.OK
    );
    return handleServiceResponse(serviceResponse, res);
  };
}

export const dashboardController = new DashboardController();
