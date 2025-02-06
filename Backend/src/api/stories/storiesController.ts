import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";
import { StoriesService } from "./storiesService";

class StoriesController {
  #storiesService: StoriesService;

  constructor(service: StoriesService = new StoriesService()) {
    this.#storiesService = service;
  }

  public getAllStories: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { page = "1", limit = "10", isDeleted = false } = req.query;
    const userId = req.user?._id;
    const serviceResponse = await this.#storiesService.getAllStories(
      page as string,
      limit as string,
      isDeleted as boolean,
      userId as string
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getStoriesById: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { storyId } = req.params;
    const userId = req.user?._id;
    const serviceResponse = await this.#storiesService.getStoriesById(
      storyId,
      userId as string
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteStoryById: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { storyId } = req.params;
    const userId = req.user?._id;
    const serviceResponse = await this.#storiesService.deleteStoryById(
      storyId,
      userId as string
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public updateStoryById: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { storyId } = req.params;
    const newData = req.body;
    const userId = req.user?._id;
    const serviceResponse = await this.#storiesService.updateStoryById(
      storyId,
      newData,
      userId as string
    );
    return handleServiceResponse(serviceResponse, res);
  };
}

export const storiesController = new StoriesController();
