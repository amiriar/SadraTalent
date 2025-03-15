import mongoose, { Document, Schema, Types } from "mongoose";
import { Message } from "../messages/messagesModel";
import { RoomTypes } from "@/enum/RoomTypes";

export interface IRoom extends Document {
  _id: Types.ObjectId;
  profile?: Schema.Types.ObjectId;
  name: string;
  bio?: string;
  pinnedMessages?: string[] | null;
  participants: Array<{
    user: ParticipantUser;
    role: "member" | "admin" | "owner";
    nickname?: string;
  }>;
  type: typeof RoomTypes;
  isGroup: boolean;
  isPublic: boolean;
  isDeleted: boolean;
  lastMessage?: Partial<Message> | null;
  // lastMessage: any;
}

interface ParticipantUser {
  _id: Types.ObjectId;
  username: string;
  profile?: Schema.Types.ObjectId;
}

const ParticipantSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: {
    type: String,
    enum: ["member", "admin", "owner"],
    default: "member",
  },
  nickname: { type: String, maxlength: 20 },
});

const RoomSchema = new Schema<IRoom>(
  {
    profile: { type: Schema.Types.ObjectId, ref: "Upload" },
    name: { type: String, required: true, maxlength: 20 },
    bio: { type: String, maxlength: 200 },
    pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    participants: [ParticipantSchema],
    type: { type: String, enum: Object.values(RoomTypes), required: true },
    isGroup: { type: Boolean, required: true },
    isPublic: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const RoomModel = mongoose.model<IRoom>("Room", RoomSchema);
export default RoomModel;
