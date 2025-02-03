import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";
import { AdminStoriesService } from "./storiesService";

class AdminStoriesController {
  #storiesService: AdminStoriesService;

  constructor(service: AdminStoriesService = new AdminStoriesService()) {
    this.#storiesService = service;
  }

  public getAllStories: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { page = "1", limit = "10", isDeleted = false } = req.query;
    const serviceResponse = await this.#storiesService.getAllStories(
      page as string,
      limit as string,
      isDeleted as boolean
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getStoriesById: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { roomId } = req.params;
    const serviceResponse = await this.#storiesService.getStoriesById(roomId);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteStoryById: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { storyId } = req.params;
    const serviceResponse = await this.#storiesService.deleteStoryById(storyId);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateStoryById: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { storyId } = req.params;
    const newData = req.body;
    const serviceResponse = await this.#storiesService.updateStoryById(
      storyId,
      newData
    );
    return handleServiceResponse(serviceResponse, res);
  };
}

export const adminStoriesController = new AdminStoriesController();
