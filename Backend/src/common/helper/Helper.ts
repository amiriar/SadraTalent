import RoomModel from "@/api/admin/rooms/roomsSchema";
import { RoomTypes } from "@/enum/RoomTypes";
import crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

export const createPublicRooms = async () => {
  const defaultRooms = ["General", "Announcements"];

  for (const name of defaultRooms) {
    const roomExists = await RoomModel.findOne({ name: name });
    if (!roomExists) {
      const newRoom = new RoomModel({
        name,
        participants: [],
        isGroup: true,
        createdAt: new Date(),
        type: name === "General" ? RoomTypes.Group : RoomTypes.Channel,
      });
      await newRoom.save();
      console.log(`Public room '${name}' created.`);
    } else {
      console.log(`Public room '${name}' already exists.`);
    }
  }
};

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY as string, "hex");
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  if (text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } else {
    return "";
  }
}

export function decrypt(text: string): string {
  if (text) {
    try {
      const [iv, encryptedText] = text.split(":");

      if (!iv || !encryptedText)
        throw new Error("Invalid encrypted text format");

      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        ENCRYPTION_KEY,
        Buffer.from(iv, "hex")
      );

      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      console.error("Decryption error:", error);
      throw error;
    }
  } else {
    return "";
  }
}
