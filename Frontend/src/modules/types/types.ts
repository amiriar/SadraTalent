import mongoose, { ObjectId, Schema } from "mongoose";

export interface IMessage {
  _id?: string;
  tempId?: string;
  sender: Sender;
  receiver: Recipient;
  content: string;
  room: string;
  publicName: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  voice?: string | IUpload;
  file?: string | IUpload;
  status: string;
  isSending: boolean;
  isEdited: boolean;
  isForwarded: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  replyTo: ReplyTo | null;
  storyId?: string | IStory;
  deletedBy: Sender[];
}

export interface ReplyTo {
  _id: mongoose.Types.ObjectId | string;
  content?: string;
  sender: Sender;
  voice?: string | IUpload;
  file?: string | IUpload;
  timestamp: Date;
  // $__?: any;
}

export interface Sender extends IUser {
  _id: string;
  phone?: string;
  stories?: string[];
}

export interface Recipient extends IUser {
  _id: string;
  phone?: string;
  stories?: string[];
  lastSeen?: Date;
  lastMessage?: Partial<IMessage>;
}

export interface Room {
  _id: string;
  name: string;
  bio: string;
  // participants: mongoose.Types.ObjectId[];
  participants: Array<{
    user: Schema.Types.ObjectId;
    role: "member" | "admin" | "owner";
    nickname?: string;
  }>;
  isGroup: boolean;
  createdAt: Date;
  isPublic: boolean;
  profile: string | IUpload;
  lastMessage?: Partial<IMessage>;
}

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

export interface IStory {
  _id: ObjectId;
  description: string;
  file: string | IUpload;
  thumbnail: string;
  hyperLink: string;
  createdAt: Date;
  updatedAt: Date;
  expireAt: Date;
  user: {
    _id: ObjectId;
    profile: string;
    username: string;
  };
  isDeleted: boolean;
  likes: ObjectId[];
}

export interface IUser {
  _id: string;
  username: string;
  profile: string;
  lastSeen?: Date;
  customStatus?: string;
  role: string;
}
