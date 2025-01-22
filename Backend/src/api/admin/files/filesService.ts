import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";
import { FilesRepository } from "./filesRepository";
import { IUpload } from "@/api/uploads/uploadsSchema";

export class FilesService {
  #fileRespository: FilesRepository;

  constructor(repository: FilesRepository = new FilesRepository()) {
    this.#fileRespository = repository;
  }

  async getAllFiles(
    page: string,
    limit: string
  ): Promise<ServiceResponse<IUpload[] | null>> {
    try {
      const files = await this.#fileRespository.getAllFiles(page, limit);

      if (!files || files.length === 0) {
        return ServiceResponse.failure(
          "No files found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<IUpload[]>(
        "Files retrieved successfully",
        files
      );
    } catch (ex) {
      const errorMessage = `Error retrieving files: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving files",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getFileById(roomId: string): Promise<ServiceResponse<IUpload | null>> {
    try {
      const files = await this.#fileRespository.getFileById(roomId);

      if (!files) {
        return ServiceResponse.failure(
          "No files found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<IUpload>(
        "Files retrieved successfully",
        files
      );
    } catch (ex) {
      const errorMessage = `Error retrieving files: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving files",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const filesService = new FilesService();
