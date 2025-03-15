import MessageModel, { IMessage } from "@/api/admin/messages/messagesSchema";
import UserModel from "@/api/admin/user/userSchema";
import { decrypt, encrypt } from "@/common/helper/Helper";
import mongoose from "mongoose";
import { Socket, Server } from "socket.io";
import path from "path";
import fs from "fs";

export const messagesEvents = (
  socket: Socket,
  io: Server,
  userSocketId: string,
  userId: string,
  onlineUsers: Map<string, any> = new Map()
) => {
  socket.on("messages:seenMessage", async ({ messages, room }) => {
    await MessageModel.updateMany(
      { _id: { $in: messages }, status: { $ne: "seen" } },
      { $set: { status: "seen" } }
    );
    io.to(room).emit("messages:seenMessageResponse", { messages, userId });
  });

  socket.on("messages:pinMessage", async ({ room, messageId }: any) => {
    try {
      await MessageModel.updateMany(
        { room, isPinned: true },
        { $set: { isPinned: false } }
      );

      const result = await MessageModel.findOneAndUpdate(
        { _id: messageId, room },
        { $set: { isPinned: true } },
        { new: true }
      ).populate("sender", "username");

      if (result) {
        io.to(room).emit("messages:pinMessageResponse", {
          room,
          message: result,
        });
      } else {
        socket.emit("error", { message: "Failed to pin the message" });
      }
    } catch (error) {
      console.error("Error pinning message:", error);
      socket.emit("error", { message: "Failed to pin the message" });
    }
  });

  socket.on("messages:unpinMessage", async ({ room, messageId }: any) => {
    try {
      const result = await MessageModel.findOneAndUpdate(
        { _id: messageId, room },
        { $set: { isPinned: false } },
        { new: true }
      ).populate("sender", "username");

      if (result) {
        io.to(room).emit("messages:unpinMessageResponse", {
          room,
          message: result,
        });
      } else {
        socket.emit("error", { message: "Failed to unpin the message" });
      }
    } catch (error) {
      console.error("Error unpinning message:", error);
      socket.emit("error", { message: "Failed to unpin the message" });
    }
  });

  socket.on("messages:editMessage", async (messageData: IMessage) => {
    const newMessage = await MessageModel.findOneAndUpdate(
      { _id: messageData._id },
      { isEdited: true, content: encrypt(messageData.content) },
      { new: true }
    )
      .populate("sender", "_id username profile")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "username profile",
        },
      });

    let replyToContent = null;

    if (newMessage?.replyTo) {
      // @ts-ignore
      const decryptedReplyContent = decrypt(newMessage.replyTo.content);
      replyToContent =
        decryptedReplyContent.length > 50
          ? decryptedReplyContent.substring(0, 50) + "..."
          : decryptedReplyContent;
    }

    const decryptedMessage = {
      ...newMessage?.toObject(),
      content: decrypt(newMessage?.content ?? ""),
      replyTo: newMessage?.replyTo
        ? // @ts-ignore
          { ...newMessage.replyTo, content: replyToContent }
        : null,
    };

    socket
      .to([userId, messageData.room])
      .emit("messages:editMessageResponse", decryptedMessage);
  });

  socket.on("messages:sendMessage", async (messageData) => {
    try {
      const { tempId, content, ...rest } = messageData;

      const encryptedContent = encrypt(content);

      const newMessage = await MessageModel.create({
        ...rest,
        content: encryptedContent,
      });

      const sender = await UserModel.findById(
        newMessage.sender,
        "username profile"
      );

      const recipient = await UserModel.findById(
        newMessage.receiver,
        "username profile"
      );

      const replyToMessage = newMessage.replyTo
        ? await MessageModel.findById(newMessage.replyTo).populate({
            path: "sender",
            select: "username profile",
          })
        : null;

      const messageToSend = {
        _id: newMessage._id,
        tempId,
        content: content,
        room: newMessage.room,
        status: newMessage.status,
        isSending: false,
        voice: newMessage.voice,
        replyTo: replyToMessage
          ? {
              _id: replyToMessage._id,
              content: decrypt(replyToMessage.content),
              sender: {
                _id: replyToMessage.sender._id,
                username: replyToMessage.sender.username,
                profile: replyToMessage.sender.profile,
              },
              file:
                typeof replyToMessage.file === "object"
                  ? replyToMessage.file
                  : null,
              voice:
                typeof replyToMessage.file === "object"
                  ? replyToMessage.file
                  : null,
            }
          : null,
        sender: {
          _id: sender?._id,
          username: sender?.username,
          profile: sender?.profile,
        },
        recipient: recipient
          ? {
              _id: recipient._id,
              username: recipient.username,
              profile: recipient.profile,
            }
          : null,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updateAt,
      };

      io.to([newMessage.room, userId]).emit(
        "messages:sendMessage",
        messageToSend
      );
    } catch (error) {
      console.error("Error sending message:", { messgae: error });
    }
  });

  socket.on("messages:forwardMessage", async (messageData) => {
    try {
      const { messageId, room, receiverId } = messageData;

      const message = await MessageModel.findById(messageId).lean();

      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }

      let finalRoom;

      if (receiverId) {
        finalRoom = `${userId}-${receiverId}`;
      } else {
        finalRoom = room;
      }

      const forwardedMessage = await MessageModel.create({
        ...message,
        room: finalRoom,
        receiver: receiverId || message.receiver,
        isForwarded: true,
        createdAt: new Date(),
        _id: new mongoose.Types.ObjectId(),
      });

      const decryptedMessage = {
        ...forwardedMessage.toObject(),
        content: decrypt(forwardedMessage.content),
      };

      io.to(finalRoom).emit(
        "messages:forwardMessageResponse",
        decryptedMessage
      );
    } catch (error) {
      console.error("Error forwarding message:", error);
      socket.emit("error", { message: "Failed to forward message" });
    }
  });

  socket.on("messages:saveMessage", async (messageData) => {
    try {
      const { receiverId, messageId } = messageData;

      const message = await MessageModel.findById(messageId).lean();

      if (!message) {
        socket.emit("error", { message: "message not found" });
      } else {
        message.receiver = receiverId;

        message.room = receiverId + "-" + receiverId;

        message.status = "seen";

        const savedMessage = await MessageModel.create(message);

        io.to(userId).emit("messages:saveMessageResponse", {
          data: savedMessage,
        });
      }
    } catch (error) {
      console.error("Error sending message:", { message: error });
    }
  });

  socket.on(
    "messages:deleteMessage",
    async ({
      messageId,
      deleteForEveryone,
      roomId,
    }: {
      messageId: string;
      deleteForEveryone: boolean;
      roomId: string;
    }) => {
      try {
        if (deleteForEveryone) {
          const result = await MessageModel.updateOne(
            { _id: messageId },
            { isDeleted: true }
          );

          if (result.modifiedCount > 0) {
            io.to(roomId).emit("messages:deleteMessageResponse", {
              success: true,
              messageId,
              deletedByEveryone: true,
            });
          } else {
            io.to(roomId).emit("messages:deleteMessageResponse", {
              success: false,
              error: "Message not found or already deleted for everyone.",
            });
          }
        } else {
          const result = await MessageModel.updateOne(
            { _id: messageId },
            { $addToSet: { deletedBy: userId } }
          );

          if (result.modifiedCount > 0) {
            io.to(roomId).emit("messages:deleteMessageResponse", {
              success: true,
              messageId,
              deletedBy: userId,
            });
          } else {
            io.to(roomId).emit("messages:deleteMessageResponse", {
              success: false,
              error: "Message not found or already deleted for this user.",
            });
          }
        }
      } catch (err: any) {
        io.emit("error", {
          message: err.message,
        });
      }
    }
  );

  socket.on(
    "messages:getHistory",
    async ({ roomName, page = 0, pageSize = 25 }) => {
      try {
        const ids = !roomName?._id ? roomName?.split("-") : roomName?._id;

        const isPrivateChat =
          ids?.length === 2 &&
          ids?.every((id: string) => mongoose.Types.ObjectId.isValid(id));

        let history = [];

        if (isPrivateChat) {
          const [senderId, recipientId] = ids;
          const isSaveMessage = senderId === recipientId;
          const senderObjectId = new mongoose.Types.ObjectId(senderId);
          const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

          history = await MessageModel.find({
            $or: [
              { sender: senderObjectId, receiver: recipientObjectId },
              { sender: recipientObjectId, receiver: senderObjectId },
              { room: isSaveMessage && roomName },
            ],
            isDeleted: false,
            deletedBy: { $not: { $elemMatch: { $eq: userId } } },
          })
            .populate("sender", "username profile phoneNumber")
            .populate("receiver", "username profile phoneNumber")
            .populate({
              path: "replyTo",
              populate: {
                path: "sender",
                select: "username profile",
              },
            })
            .populate({
              path: "storyId",
              select:
                "description file thumbnail hyperLink user isDeleted expireAt seenBy likes isAccepted",
            })
            .populate({
              path: "file",
              select: "-__v",
            })
            .populate({
              path: "voice",
              select: "-__v",
            })
            .sort({ createdAt: -1 })
            .skip(page * pageSize)
            .limit(pageSize)
            .lean();
        } else {
          history = await MessageModel.find({
            room: roomName,
            isDeleted: false,
            deletedBy: { $not: { $elemMatch: { $eq: userId } } },
          })
            .populate("sender", "username profile phoneNumber")
            .populate("receiver", "username profile phoneNumber")
            .populate({
              path: "replyTo",
              populate: {
                path: "sender",
                select: "username profile",
              },
            })
            .populate({
              path: "storyId",
              select:
                "description file thumbnail hyperLink user isDeleted expireAt seenBy likes isAccepted",
            })
            .populate({
              path: "file",
              select: "-__v",
            })
            .populate({
              path: "voice",
              select: "-__v",
            })
            .sort({ createdAt: -1 })
            .skip(page * pageSize)
            .limit(pageSize)
            .lean();
        }

        const decryptedHistory = history.map((message) => {
          const decryptedContent = decrypt(message.content);
          let replyToContent = null;

          if (message.replyTo) {
            // @ts-ignore
            const decryptedReplyContent = decrypt(message.replyTo.content);
            replyToContent =
              decryptedReplyContent.length > 50
                ? decryptedReplyContent.substring(0, 50) + "..."
                : decryptedReplyContent;
          }

          if (message.file) {
            const filePath = path.join(
              __dirname,
              "..",
              "..",
              "..",
              typeof message.file == "string"
                ? message.file
                : message.file.filePath
            );

            if (!fs.existsSync(filePath)) {
              message.file = ".404";
            }
          }

          if (message.voice) {
            const voicePath = path.join(
              __dirname,
              "..",
              "..",
              "..",
              typeof message.voice == "string"
                ? message.voice
                : message.voice.filePath
            );
            if (!fs.existsSync(voicePath)) {
              message.voice = ".404";
            }
          }

          return {
            ...message,
            content: decryptedContent,
            replyTo: message.replyTo
              ? // @ts-ignore
                { ...message.replyTo, content: replyToContent }
              : null,
          };
        });

        socket
          .to(roomName)
          .emit("messages:sendHistory", decryptedHistory?.reverse());
      } catch (error) {
        console.error("Error fetching chat history:", error);
        socket.emit("messages:sendHistory", []);
      }
    }
  );

  socket.on("messages:search", async ({ word, room }) => {
    try {
      if (!word || !room) {
        socket.emit("messages:searchResults", []);
        return;
      }

      // Removed pagination logic: pageSize, page, maxCount, hasMoreMessages
      // const pageSize = 50;  // You can uncomment this later if you want to add pagination
      // let page = 0;  // You can uncomment this later if you want to add pagination
      // let foundMessages = [];  // This will store all the found messages

      const lowerCaseWord = word.toLowerCase();

      const messages = await MessageModel.find({
        room,
        isDeleted: false,
        deletedBy: { $not: { $elemMatch: { $eq: userId } } },
      })
        .sort({ createdAt: -1 })
        .populate("sender", "username profile phone")
        .populate("receiver", "username profile phone")
        .populate({
          path: "replyTo",
          populate: {
            path: "sender",
            select: "username profile",
          },
        })
        .lean();

      if (messages.length === 0) {
        socket.emit("messages:searchResults", []);
        return;
      }

      const foundMessages = [];

      for (const message of messages) {
        const decryptedContent = decrypt(message.content);

        let decryptedReplyContent = null;
        // @ts-ignore
        if (message.replyTo?.content) {
          // @ts-ignore
          decryptedReplyContent = decrypt(message.replyTo.content);
        }

        if (
          decryptedContent.toLowerCase().includes(lowerCaseWord) ||
          (decryptedReplyContent &&
            decryptedReplyContent.toLowerCase().includes(lowerCaseWord))
        ) {
          foundMessages.push({
            ...message,
            content: decryptedContent,
            replyTo: message.replyTo
              ? // @ts-ignore
                { ...message.replyTo, content: decryptedReplyContent }
              : null,
          });
        }
      }

      socket
        .to(typeof room === "string" ? room : room._id)
        .emit("messages:searchResults", foundMessages.reverse());
    } catch (error) {
      console.error("Error searching messages:", error);
      socket.emit("messages:searchResults", []);
    }
  });
};
