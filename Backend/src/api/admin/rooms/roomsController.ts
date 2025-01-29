import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";
import { RoomsService } from "./roomsService";

class RoomsController {
  #roomsService: RoomsService;

  constructor(service: RoomsService = new RoomsService()) {
    this.#roomsService = service;
  }

  public getAllRooms: RequestHandler = async (req: Request, res: Response) => {
    const { page = "1", limit = "10" } = req.query;
    const serviceResponse = await this.#roomsService.getAllRooms(
      page as string,
      limit as string
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getRoomById: RequestHandler = async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const serviceResponse = await this.#roomsService.getRoomById(roomId);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateRoomById: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { roomId } = req.params;
    const serviceResponse = await this.#roomsService.updateRoomById(
      roomId,
      req.body
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteRoomById: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { roomId } = req.params;
    const serviceResponse = await this.#roomsService.deleteRoomById(roomId);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const roomsController = new RoomsController();
