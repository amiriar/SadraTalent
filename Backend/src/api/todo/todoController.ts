import { todoService } from "@/api/todo/todoService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";

class TodoController {
  public getTodos: RequestHandler = async (_req: Request, res: Response) => {
    const user = _req.user;
    const serviceResponse = await todoService.findAll(user?._id as string);
    return handleServiceResponse(serviceResponse, res);
  };

  public getTodo: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id; // Mongoose IDs are strings
    const serviceResponse = await todoService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public createTodo: RequestHandler = async (req: Request, res: Response) => {
    const todoData = req.body;
    todoData.author = req.user?._id;
    const serviceResponse = await todoService.create(todoData);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateTodo: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id; // Mongoose IDs are strings
    const todoData = req.body;
    const serviceResponse = await todoService.update(id, todoData);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteTodo: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id; // Mongoose IDs are strings
    const serviceResponse = await todoService.delete(id);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const todoController = new TodoController();
