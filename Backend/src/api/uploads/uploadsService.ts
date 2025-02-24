import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";
import { UploadsRepository } from "./uploadsRepository";
import { IUpload } from "./uploadsSchema";
import { Request } from "express";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export class UploadsService {
  #uploadsRepository: UploadsRepository;

  constructor(repository: UploadsRepository = new UploadsRepository()) {
    this.#uploadsRepository = repository;
  }

  private handleFileAddress(req: Request) {
    if (req?.body?.fileUploadPath && req?.body?.filename) {
      return (req.body.fileUrl = path
        .join(req.body.fileUploadPath, req.body.filename)
        .replace(/\\/g, "/"));
    }
  }

  async uploadFile(
    req: Request
  ): Promise<ServiceResponse<Partial<IUpload> | null>> {
    const fileAddress = this.handleFileAddress(req);
    return this.handleFileUpload(
      req.user?._id ?? "",
      "Voice uploaded successfully",
      req.file ?? null,
      fileAddress
    );
  }
  async uploadVoice(
    req: Request
  ): Promise<ServiceResponse<Partial<IUpload> | null>> {
    if (!req.file) {
      return ServiceResponse.failure(
        "no file was sent",
        null,
        StatusCodes.BAD_REQUEST
      );
    }

    const webmFilePath = this.handleFileAddress(req);

    const mp3FilePath = path.join(
      "public",
      "uploads",
      "voiceMessage",
      `${uuidv4()}+${req.user?._id}.mp3`
    );

    ffmpeg(webmFilePath)
      .toFormat("mp3")
      .on("end", async () => {
        fs.unlinkSync(webmFilePath ?? "");

        return ServiceResponse.success<Partial<IUpload>>(
          "Voice uploaded successfully",
          {
            filePath: mp3FilePath,
          }
        );
      })
      .on("error", (err) => {
        console.error("Error converting file:", err);
        return ServiceResponse.failure(
          "An error occurred while uploading the file",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      })
      .save(mp3FilePath);

    return this.handleFileUpload(
      req.user?._id ?? "",
      "Voice uploaded successfully",
      req.file ?? null,
      mp3FilePath
    );
  }

  async uploadStory(
    req: Request
  ): Promise<ServiceResponse<Partial<IUpload> | null>> {
    const fileAddress = this.handleFileAddress(req);
    return this.handleFileUpload(
      req.user?._id ?? "",
      "Voice uploaded successfully",
      req.file ?? null,
      fileAddress
    );
  }

  async uploadThumbnail(
    req: Request
  ): Promise<ServiceResponse<Partial<IUpload> | null>> {
    const fileAddress = this.handleFileAddress(req);
    return this.handleFileUpload(
      req.user?._id ?? "",
      "Voice uploaded successfully",
      req.file ?? null,
      fileAddress
    );
  }

  private async handleFileUpload(
    uploadedBy: string,
    successMessage: string,
    file: Express.Multer.File | null,
    fileAddress?: string
  ): Promise<ServiceResponse<Partial<IUpload> | null>> {
    try {
      if (!file) {
        throw new Error("No file provided");
      }

      if (!fileAddress) {
        throw new Error("File address could not be generated");
      }

      if (!file.mimetype) {
        throw new Error("File mimetype is missing");
      }

      if (!file.size) {
        throw new Error("File size is missing");
      }

      const uploadedFile = await this.#uploadsRepository.uploadFile(
        fileAddress,
        file.mimetype,
        uploadedBy,
        file.size
      );

      return ServiceResponse.success<Partial<IUpload>>(successMessage, {
        _id: uploadedFile?._id,
        filePath: fileAddress,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedBy,
        isDeleted: false,
      });
    } catch (ex) {
      const errorMessage = `Error uploading file: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while uploading the file",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const uploadsService = new UploadsService();
