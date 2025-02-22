import mongoose, { Schema } from "mongoose";

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
  $__?: unknown;
}

export interface Sender {
  _id: string;
  username?: string;
  phone?: string;
  profile?: string;
}

export interface Recipient {
  _id: string;
  username?: string;
  phone?: string;
  profile?: string;
  customStatus?: string;
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

export interface IUser {
  _id: string;
  username: string;
  profile: string;
  lastSeen?: Date;
  customStatus: string;
}
