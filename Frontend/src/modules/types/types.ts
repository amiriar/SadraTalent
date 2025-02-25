import mongoose, { ObjectId, Schema } from "mongoose";

export interface Message {
  _id?: string;
  tempId: string;
  sender: Sender;
  receiver: Recipient;
  content: string;
  room: string;
  publicName: string;
  createdAt?: Date | null;
  voiceUrl?: string | IUpload;
  fileUrl?: string | IUpload;
  status: string;
  isSending: boolean;
  isEdited: boolean;
  isForwarded: boolean;
  isPinned: boolean;
  replyTo: ReplyTo;
  storyId?: string | IStory;
}

export interface ReplyTo {
  _id: mongoose.Types.ObjectId | string;
  content?: string;
  sender: Sender;
  voiceUrl?: string | IUpload;
  fileUrl?: string | IUpload;
  timestamp: Date;
  $__?: any;
}

export interface Sender {
  _id: string;
  username?: string;
  phone?: string;
  profile?: string | IUpload;
  stories?: string[];
}

export interface Recipient {
  _id: string;
  username?: string;
  phone?: string;
  profile?: string | IUpload;
  customStatus?: string;
  stories?: string[];
  lastSeen?: Date;
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
  customStatus: string;
}
