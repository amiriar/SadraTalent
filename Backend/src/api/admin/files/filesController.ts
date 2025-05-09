import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";
import { FilesService } from "./filesService";

class FilesController {
  #filesService: FilesService;

  constructor(service: FilesService = new FilesService()) {
    this.#filesService = service;
  }

  public getAllFiles: RequestHandler = async (req: Request, res: Response) => {
    const { page = "1", limit = "10" } = req.query;
    const serviceResponse = await this.#filesService.getAllFiles(
      page as string,
      limit as string
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getFileById: RequestHandler = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const serviceResponse = await this.#filesService.getFileById(fileId);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateFileById: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { fileId } = req.params;
    const serviceResponse = await this.#filesService.updateFileById(
      fileId,
      req.body
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteFileById: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { fileId } = req.params;
    const serviceResponse = await this.#filesService.deleteFileById(fileId);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const filesController = new FilesController();
