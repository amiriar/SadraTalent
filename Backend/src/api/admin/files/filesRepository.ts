import UploadModel, { IUpload } from "@/api/uploads/uploadsSchema";

export class FilesRepository {
  async getAllFiles(page: string, limit: string): Promise<IUpload[] | null> {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    return await UploadModel.find({}).skip(skip).limit(parseInt(limit));
  }

  async getFileById(roomId: string): Promise<IUpload | null> {
    return await UploadModel.findOne({
      _id: roomId,
    });
  }
}
