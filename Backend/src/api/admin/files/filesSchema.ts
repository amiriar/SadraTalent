import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRoom extends Document {
  profile?: string;
  name: string;
  bio?: string;
  pinnedMessages?: string[] | null;
  participants: Array<{
    user: ParticipantUser;
    role: "member" | "admin" | "owner";
    nickname?: string;
  }>;
  isGroup: boolean;
  isPublic: boolean;
  isDeleted: boolean;
}

interface ParticipantUser {
  _id: Types.ObjectId;
  username: string;
  profile?: string;
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
    profile: { type: String },
    name: { type: String, required: true, maxlength: 20 },
    bio: { type: String, maxlength: 200 },
    pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    participants: [ParticipantSchema],
    isGroup: { type: Boolean, required: true },
    isPublic: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const RoomModel = mongoose.model<IRoom>("Room", RoomSchema);
export default RoomModel;
