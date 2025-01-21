import { authService } from "@/api/auth/authService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";
import { userService } from "../admin/user/userService";

class AuthController {
  public login: RequestHandler = async (req: Request, res: Response) => {
    const { usernameOrEmail, password } = req.body;
    const serviceResponse = await authService.authenticate(
      usernameOrEmail,
      password
    ); // Update service call
    return handleServiceResponse(serviceResponse, res);
  };

  public register: RequestHandler = async (req: Request, res: Response) => {
    const userData = req.body;
    const serviceResponse = await authService.register(userData);
    return handleServiceResponse(serviceResponse, res);
  };

  // public forgetPassword: RequestHandler = async (req: Request, res: Response) => {
  //   const { email } = req.body;
  //   const serviceResponse = await authService.forgetPassword(email);  // Update service call for forget password
  //   return handleServiceResponse(serviceResponse, res);
  // };
  public refreshToken: RequestHandler = async (req: Request, res: Response) => {
    const { token } = req.body;

    const responseToken = await authService.refreshToken(token);

    return handleServiceResponse(responseToken, res);
  };

  public logout: RequestHandler = async (req: Request, res: Response) => {
    const user = req.user;
    const serviceResponse = await authService.logout(user?._id as string);
    return handleServiceResponse(serviceResponse, res);
  };

  public sendOtp: RequestHandler = async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;
    const serviceResponse = await authService.sendOtp(phoneNumber);
    return handleServiceResponse(serviceResponse, res);
  };

  public verifyOtp: RequestHandler = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const serviceResponse = await authService.loginWithOtp(email, otp);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const authController = new AuthController();
