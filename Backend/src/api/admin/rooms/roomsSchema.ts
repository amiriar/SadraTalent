import mongoose, { Document, Schema, Types } from "mongoose";
import { Message } from "../messages/messagesModel";
import { RoomRoles, RoomTypes } from "@/common/utils/enum";

type RoomType = (typeof RoomTypes)[keyof typeof RoomTypes]; 

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
  type: RoomType; // Use extracted type here
  isPublic: boolean;
  isDeleted: boolean;
  lastMessage?: Partial<Message> | null;
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
    enum: [RoomRoles.Admin, RoomRoles.User, RoomRoles.Owner],
    default: RoomRoles.User,
  },
  nickname: { type: String, maxlength: 20 },
});

const RoomSchema = new Schema<IRoom>(
  {
    profile: { type: Schema.Types.ObjectId, ref: "Upload" },
    name: { type: String, required: true },
    bio: { type: String, maxlength: 200 },
    pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    participants: [ParticipantSchema],
    type: { type: String, enum: Object.values(RoomTypes), required: true },
    isPublic: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const RoomModel = mongoose.model<IRoom>("Room", RoomSchema);
export default RoomModel;
