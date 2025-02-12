import UploadModel, { IUpload } from "./uploadsSchema";

export class UploadsRepository {
  async uploadFile(
    fileAddress: string,
    fileMimetype: string,
    uploadedBy: string,
    fileSize: number
  ): Promise<IUpload | null> {
    try {
      const newUpload = await UploadModel.create({
        filePath: fileAddress,
        fileType: fileMimetype,
        uploadedBy,
        fileSize: fileSize,
      });
      return newUpload;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  }
}
