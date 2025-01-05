import mongoose, { Schema, model, Document, Types } from "mongoose"; // {{ edit_1 }}

export interface IUser extends Document {
  // {{ edit_2 }}
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
  customStatus: string;
} // {{ edit_3 }}

const UserSchema = new Schema<IUser>( // {{ edit_4 }}
  {
    username: { type: String, required: false },
    firstname: { type: String, required: false },
    lastname: { type: String, required: false },
    role: { type: String, default: "USER" },
    lastDateIn: { type: String, required: false },
    email: { type: String, required: false },
    password: { type: String, required: false },
    phoneNumber: { type: String, required: true },
    profile: { type: String, required: false },
    bio: { type: String, required: false },
    otp: { type: String, required: false },
    otpExpire: { type: Date, required: false },
    status: { type: String, default: "offline" },
    customStatus: { type: String, default: "", maxlength: 15 },
    lastSeen: { type: Date },
    refreshToken: { type: String },
    stories: { type: [Types.ObjectId], ref: "story", default: [] },
  },
  { timestamps: true }
); // {{ edit_5 }}

const UserModel = model<IUser>("User", UserSchema); // {{ edit_6 }}
export default UserModel; // {{ edit_7 }}
