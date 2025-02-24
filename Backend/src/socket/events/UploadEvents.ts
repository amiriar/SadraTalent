import MessageModel from "@/api/admin/messages/messagesSchema";
import UserModel from "@/api/admin/user/userSchema";
import { Socket, Server } from "socket.io";

export const uploadEvents = (
  socket: Socket,
  io: Server,
  userSocketId: string,
  userId: string
) => {
  socket.on("uploads:fileUpload", async (data: any) => {
    try {
      const { fileUrl, sender, room, receiver } = data;

      if (!sender || !room || !fileUrl) {
        throw new Error("Missing data");
      }

      const messageData: any = {
        fileUrl,
        room: room._id ? room._id : room,
        sender: sender._id ? sender._id : sender,
      };

      if (receiver && receiver._id) {
        messageData.receiver = receiver._id;
      }

      const newMessage = await MessageModel.create(messageData);

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

      // io.to(room._id ? room._id : room).emit(
      //   "fileUpload-respond",
      //   messageToSend
      // );
      io.emit("uploads:fileUploadRespond", messageToSend);
    } catch (error) {
      console.error("Error processing voice message:", error);
      io.emit("error", { message: error });
    }
  });

  socket.on("uploads:voiceMessage", async (data: any) => {
    try {
      const { mp3Url, room } = data;

      if (!mp3Url || !room || !userId) {
        throw new Error("Missing data");
      }

      const messageData = {
        voiceUrl: mp3Url,
        room: room._id ? room._id : room,
        sender: userId,
      };

      const newMessage = await MessageModel.create(messageData);

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
      io.to(room._id ? room._id : room).emit(
        "uploads:voiceMessageResponse",
        messageToSend
      );
    } catch (error) {
      console.error("Error processing voice message:", { message: error });
    }
  });
};
