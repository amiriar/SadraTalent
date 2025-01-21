import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStory extends Document {
  description?: string;
  file?: string;
  thumbnail?: string;
  hyperLink?: string;
  user: Types.ObjectId;
  isDeleted: boolean;
  expireAt: Date;
  seenBy: Types.ObjectId[];
  likes: Array<
    | Types.ObjectId
    | { _id: Types.ObjectId; username: string; profile?: string }
  >;
  isAccepted: boolean;
}

const StorySchema = new Schema<IStory>(
  {
    description: { type: String, maxlength: 2000 },
    file: { type: String },
    thumbnail: { type: String },
    hyperLink: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
    isAccepted: { type: Boolean, default: true }, // Default: true; change if needed
    expireAt: { type: Date, required: true },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [
      {
        type: Schema.Types.Mixed, // Allows for ObjectId or custom object
        validate: {
          validator: (value: any) =>
            mongoose.Types.ObjectId.isValid(value) ||
            (typeof value === "object" &&
              mongoose.Types.ObjectId.isValid(value._id) &&
              typeof value.username === "string"),
          message: "Invalid like format.",
        },
      },
    ],
  },
  { timestamps: true }
);

const StoryModel = mongoose.model<IStory>("Story", StorySchema);
export default StoryModel;
