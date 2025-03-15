import { Message } from "@/api/admin/messages/messagesModel";
import MessageModel, { IMessage } from "@/api/admin/messages/messagesSchema";
import UserModel from "@/api/admin/user/userSchema";
import { Socket, Server } from "socket.io";

export const uploadEvents = (
  socket: Socket,
  io: Server,
  userSocketId: string,
  userId: string,
  onlineUsers: Map<string, any> = new Map()
) => {
  socket.on("uploads:fileUpload", async (data: any) => {
    try {
      const { fileId, sender, room, receiver } = data;

      if (!sender || !room || !fileId) {
        throw new Error("Missing data");
      }

      const messageData: Partial<IMessage> = {
        file: fileId,
        room: room._id ? room._id : room,
        sender: sender._id ? sender._id : sender,
      };

      if (receiver && receiver._id) {
        messageData.receiver = receiver._id;
      }

      const newMessage = await (
        await MessageModel.create(messageData)
      ).populate("file", "-__v");

      const Fullsender = await UserModel.findById(
        newMessage.sender,
        "username profile"
      );

      let Fullreceiver = null;
      if (newMessage.receiver) {
        Fullreceiver = await UserModel.findById(
          newMessage.receiver,
          "username profile"
        );
      }

      const messageToSend = {
        ...newMessage.toObject(),
        sender: {
          _id: Fullsender?._id,
          username: Fullsender?.username,
          profile: Fullsender?.profile,
        },
        recipient: Fullreceiver
          ? {
              _id: Fullreceiver._id,
              username: Fullreceiver.username,
              profile: Fullreceiver.profile,
            }
          : null,
      };
      io.to(room._id).emit("uploads:fileUploadRespond", messageToSend);
    } catch (error) {
      console.error("Error processing voice message:", error);
      io.to(userId).emit("error", { message: error });
    }
  });

  socket.on("uploads:voiceMessage", async (data: any) => {
    try {
      const { voiceId, room } = data;

      if (!voiceId || !room || !userId) {
        throw new Error("Missing data");
      }

      const messageData = {
        voice: voiceId,
        room: room._id ? room._id : room,
        sender: userId,
      };

      const newMessage = await (
        await MessageModel.create(messageData)
      ).populate("voice", "-__v");

      const sender = await UserModel.findById(
        newMessage.sender,
        "username profile"
      );
      const receiver = await UserModel.findById(
        newMessage.receiver,
        "username profile"
      );

      const messageToSend = {
        ...newMessage.toObject(),
        sender: {
          _id: sender?._id,
          username: sender?.username,
          profile: sender?.profile,
        },
        receiver: receiver
          ? {
              _id: receiver._id,
              username: receiver.username,
              profile: receiver.profile,
            }
          : null,
      };
      io.to(room._id).emit("uploads:voiceMessageResponse", messageToSend);
    } catch (error) {
      console.error("Error processing voice message:", { message: error });
    }
  });
};
