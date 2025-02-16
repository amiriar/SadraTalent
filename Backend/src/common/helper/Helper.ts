import RoomModel from "@/api/admin/rooms/roomsSchema";
import crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

export const createPublicRooms = async () => {
  const defaultRooms = ["General", "Announcements"];

  for (const name of defaultRooms) {
    // Check if the room already exists
    const roomExists = await RoomModel.findOne({ name: name });
    if (!roomExists) {
      // Create the room if it doesn't exist
      const newRoom = new RoomModel({
        name,
        participants: [],
        isGroup: true,
        createdAt: new Date(),
      });
      await newRoom.save();
      console.log(`Public room '${name}' created.`);
    } else {
      console.log(`Public room '${name}' already exists.`);
    }
  }
};

// Use a fixed, securely stored encryption key
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY as string, "hex"); // 32-byte key
const IV_LENGTH = 16; // AES block size for AES-256-CBC

export function encrypt(text: string): string {
  if (text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`; // Store IV and encrypted text together
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
