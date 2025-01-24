import { userService } from "@/api/admin/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";
import { MessageService } from "./messagesService";

class MessageController {
  #messageService: MessageService;

  constructor(service: MessageService = new MessageService()) {
    this.#messageService = service;
  }

  public getMessagesBetweenUsersByMongoId: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { senderId, receiverId } = req.params;
    const { page = "1", limit = "10" } = req.query;
    const serviceResponse =
      await this.#messageService.getMessagesBetweenUsersByMongoId(
        senderId,
        receiverId,
        page as string,
        limit as string
      );
    return handleServiceResponse(serviceResponse, res);
  };

  public getMessagesFromRoom: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { messageId } = req.params;
    const { page = "1", limit = "10" } = req.query;
    const serviceResponse = await this.#messageService.getMessagesFromRoom(
      messageId,
      page as string,
      limit as string
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public searchMessages: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { word } = req.query;
    const { page = "1", limit = "10" } = req.query;

    const serviceResponse = await this.#messageService.searchMessages(
      word as string,
      page as string,
      limit as string
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteMessageById: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { messageId } = req.params;
    const serviceResponse = await this.#messageService.deleteMessageById(
      messageId
    );
    return handleServiceResponse(serviceResponse, res);
  };
}

export const messageController = new MessageController();
