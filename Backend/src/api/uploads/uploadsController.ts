import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";
import { UploadsService } from "./uploadsService";

class UploadController {
  #uploadService: UploadsService;

  constructor(service: UploadsService = new UploadsService()) {
    this.#uploadService = service;
  }

  public uploadFile: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await this.#uploadService.uploadFile(req);
    return handleServiceResponse(serviceResponse, res);
  };

  public uploadVoice: RequestHandler = async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const serviceResponse = await this.#uploadService.uploadVoice(req);
    return handleServiceResponse(serviceResponse, res);
  };

  public uploadStory: RequestHandler = async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const serviceResponse = await this.#uploadService.uploadStory(req);
    return handleServiceResponse(serviceResponse, res);
  };

  public uploadThumbnail: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const serviceResponse = await this.#uploadService.uploadThumbnail(req);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const uploadController = new UploadController();
