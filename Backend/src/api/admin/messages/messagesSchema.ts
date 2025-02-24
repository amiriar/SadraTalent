import { IUpload } from "@/api/uploads/uploadsSchema";
import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface IUserInfo {
  _id: ObjectId | string;
  username: string;
  profile: IUpload | string;
  phone: string;
}

export interface IMessage extends Document {
  sender: IUserInfo;
  receiver: IUserInfo;
  content: string;
  room: string;
  // timestamp: Date;
  // date: string;
  status: "sent" | "delivered" | "seen";
  voiceUrl?: IUpload | string;
  fileUrl?: IUpload | string;
  isEdited: boolean;
  isPinned: boolean;
  isDeleted: boolean;
  isForwarded: boolean;
  isDeletedForMe: boolean;
  replyTo: ObjectId | string;
  forwardedFrom?: ObjectId | string;
  deletedBy?: ObjectId | string;
  storyId?: ObjectId | string;
  createdAt: Date;
  updateAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: false },
    room: { type: String, required: true },
    // date: { type: String, required: false },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen", "detail"],
      default: "sent",
    },
    voiceUrl: { type: Schema.Types.ObjectId, ref: "Upload", required: false },
    fileUrl: { type: Schema.Types.ObjectId, ref: "Upload", required: false },
    isPinned: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isForwarded: { type: Boolean, default: false },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "story",
      required: false,
    },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
export default MessageModel;
