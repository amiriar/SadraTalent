import { userService } from "@/api/admin/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";
import { MessageService } from "./messagesService";

class MessageController {
  #messageService: MessageService;

  constructor(service: MessageService = new MessageService()) {
    this.#messageService = service;
  }

  public getMessagesBetweenUsersByMongoId: RequestHandler = async (req: Request, res: Response) => {
    const { senderId, receiverId } = req.params;
    const serviceResponse = await this.#messageService.getMessagesBetweenUsersByMongoId(senderId, receiverId);
    return handleServiceResponse(serviceResponse, res);
  };

}


export const messageController = new MessageController();
