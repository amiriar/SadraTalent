import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: string;
  username: string;
  firstname: string;
  lastname: string;
  role?: string;
  lastDateIn?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  profile?: string;
  bio?: string;
  otp?: string | null;
  otpExpire?: Date | null;
  status?: string;
  lastSeen?: Date;
  stories: Types.ObjectId | null;
  refreshToken?: string | null;
  refreshTokenExpires?: Date | null;
  customStatus: string;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: false },
    firstname: { type: String, required: false },
    lastname: { type: String, required: false },
    role: { type: String, default: "USER" },
    lastDateIn: { type: String, required: false },
    email: { type: String, required: false },
    password: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    profile: { type: String, required: false },
    bio: { type: String, required: false },
    otp: { type: String, required: false },
    otpExpire: { type: Date, required: false },
    status: { type: String, default: "offline" },
    customStatus: { type: String, default: "", maxlength: 15 },
    lastSeen: { type: Date },
    refreshToken: { type: String },
    refreshTokenExpires: { type: Date },
    stories: { type: [Types.ObjectId], ref: "story", default: [] },
  },
  { timestamps: true }
);

const UserModel = model<IUser>("User", UserSchema);
export default UserModel;
