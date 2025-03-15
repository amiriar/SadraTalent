import { Roles, Status } from "@/common/utils/enum";
import mongoose, { Schema, model, Document, Types } from "mongoose";
import { IStory } from "../stories/storiesSchema";

export interface IUser extends Document {
  _id: string;
  username: string;
  firstname: string;
  lastname: string;
  role?: Roles;
  lastDateIn?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  profile?: string;
  bio?: string;
  otp?: string | null;
  otpExpire?: Date | null;
  status?: Status;
  lastSeen?: Date;
  stories: IStory[] | Types.ObjectId[] | null;
  refreshToken?: string | null;
  refreshTokenExpires?: Date | null;
  customStatus: string;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: false },
    firstname: { type: String, required: false },
    lastname: { type: String, required: false },
    role: { type: String, enum: Object.values(Roles), default: Roles.User },
    lastDateIn: { type: String, required: false },
    email: { type: String, required: false },
    password: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    profile: { type: String, required: false },
    bio: { type: String, required: false },
    otp: { type: String, required: false },
    otpExpire: { type: Date, required: false },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.offline,
    },
    customStatus: { type: String, default: "", maxlength: 15 },
    lastSeen: { type: Date },
    refreshToken: { type: String },
    refreshTokenExpires: { type: Date },
    stories: { type: [Types.ObjectId], ref: "Story", default: [] },
  },
  { timestamps: true }
);

const UserModel = model<IUser>("User", UserSchema);
export default UserModel;
