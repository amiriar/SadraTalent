import UploadModel, { IUpload } from "@/api/uploads/uploadsSchema";

export class FilesRepository {
  async getAllFiles(page: string, limit: string): Promise<IUpload[] | null> {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    return await UploadModel.find({}).skip(skip).limit(parseInt(limit));
  }

  async getFileById(fileId: string): Promise<IUpload | null> {
    return await UploadModel.findOne({
      _id: fileId,
    });
  }

  async updateFileById(fileId: string, newData: any): Promise<IUpload | null> {
    return await UploadModel.findOneAndUpdate(
      {
        _id: fileId,
      },
      newData,
      { new: true }
    );
  }

  async deleteFileById(fileId: string): Promise<IUpload | null> {
    return await UploadModel.findByIdAndUpdate(
      {
        _id: fileId,
      },
      { isDeleted: true }
    );
  }
}
