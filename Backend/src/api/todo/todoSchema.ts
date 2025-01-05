import mongoose, { Schema, Types, type Document } from "mongoose";
import { z } from "zod";

export interface ITodo extends Document {
  content: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate: string;
  author: string;
  date: string;
  priority: "low" | "medium" | "high";
  tags: string[];
  order: number;
}

const TodoSchema: Schema = new Schema(
  {
    content: { type: String, required: true },
    completed: { type: Boolean, default: false },
    date: { type: String, required: true },
    dueDate: { type: String, required: true },
    author: { type: Types.ObjectId, required: true, ref: "User" },
    priority: { type: String, enum: ["low", "medium", "high"], required: true },
    tags: { type: [String], required: true },
    order: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

export const TodoModel = mongoose.model<ITodo>("Todo", TodoSchema);
