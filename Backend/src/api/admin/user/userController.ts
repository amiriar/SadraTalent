import { userService } from "@/api/admin/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";

class UserController {
  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id; // Mongoose IDs are strings
    const serviceResponse = await userService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  // public createUser: RequestHandler = async (req: Request, res: Response) => {
  //   const userData = req.body;
  //   const serviceResponse = await userService.create(userData);
  //   return handleServiceResponse(serviceResponse, res);
  // };

  public updateUser: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id; // Mongoose IDs are strings
    const userData = req.body;
    const serviceResponse = await userService.update(id, userData);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteUser: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id; // Mongoose IDs are strings
    const serviceResponse = await userService.delete(id);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const userController = new UserController();
