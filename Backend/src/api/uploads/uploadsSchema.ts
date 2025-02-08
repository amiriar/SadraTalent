import mongoose, { Document, ObjectId, Schema, Types } from "mongoose";

export interface IUpload extends Document {
  _id: ObjectId;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UploadSchema = new Schema<IUpload>(
  {
    filePath: { type: String, required: true },
    fileType: {
      type: String,
      // enum: ["image", "video", "audio", "document", "other"],
      required: true,
    },
    fileSize: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UploadModel = mongoose.model<IUpload>("Upload", UploadSchema);
export default UploadModel;
