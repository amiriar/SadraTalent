import mongoose, { ObjectId, Schema } from "mongoose";

export interface Message {
  _id?: string;
  tempId: string;
  sender: Sender;
  recipient: Recipient;
  content: string;
  room: string;
  publicName: string;
  timestamp?: Date | null;
  voiceUrl?: string;
  fileUrl?: string;
  status: string;
  isSending: boolean;
  isEdited: boolean;
  isForwarded: boolean;
  isPinned: boolean;
  replyTo: ReplyTo;
}

export interface ReplyTo {
  _id: mongoose.Types.ObjectId | string;
  content?: string;
  sender: Sender;
  voiceUrl?: string;
  fileUrl?: string;
  timestamp: Date;
  $__?: any;
}

export interface Sender {
  _id: string;
  username?: string;
  phone?: string;
  profile?: string;
  stories?: string[];
}

export interface Recipient {
  _id: string;
  username?: string;
  phone?: string;
  profile?: string;
  customStatus: string;
  stories: string[];
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
}

export interface IStory {
  _id: ObjectId;
  description: string;
  file: string;
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
