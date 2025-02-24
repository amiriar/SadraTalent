import MessageModel from "@/api/admin/messages/messagesSchema";
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
  userId: string
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

  socket.on("messages:editMessage", async (data) => {
    const { messageData } = data;
    const encryptedContent = encrypt(messageData.content);

    const newMessage = await MessageModel.findOneAndUpdate(
      { _id: messageData._id },
      { isEdited: true, content: encryptedContent },
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

    socket.emit("messages:editMessageResponse", decryptedMessage);
  });

  socket.on("messages:sendMessage", async (messageData) => {
    try {
      const { tempId, content, ...rest } = messageData;

      // Encrypt the message content before saving
      const encryptedContent = encrypt(content);

      // Save the encrypted message to the database
      const newMessage = await MessageModel.create({
        ...rest,
        content: encryptedContent,
      });

      // Prepare message to send, decrypting for the frontend
      const sender = await UserModel.findById(
        newMessage.sender,
        "username profile"
      );
      const recipient = await UserModel.findById(
        newMessage.receiver,
        "username profile"
      );
      const decryptedContent = decrypt(newMessage.content);

      const replyToMessage = newMessage.replyTo
        ? await MessageModel.findById(newMessage.replyTo).populate({
            path: "sender",
            select: "username profile",
          })
        : null;

      const messageToSend = {
        _id: newMessage._id,
        tempId,
        content: decryptedContent,
        room: newMessage.room,
        status: newMessage.status,
        isSending: false,
        voiceUrl: newMessage.voiceUrl,
        replyTo: replyToMessage
          ? {
              _id: replyToMessage._id,
              content: decrypt(replyToMessage.content),
              sender: {
                _id: replyToMessage.sender._id,
                username: replyToMessage.sender.username,
                profile: replyToMessage.sender.profile,
              },
              fileUrl: replyToMessage.fileUrl || null,
              voiceUrl: replyToMessage.voiceUrl || null,
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

      io.emit("messages:message", messageToSend);
    } catch (error) {
      console.error("Error sending message:", { messgae: error });
    }
  });

  socket.on("messages:forwardMessage", async (messageData) => {
    try {
      const { message, room, receiverId } = messageData;

      if (message.replyTo) message.replyTo = message.replyTo._id;

      if (message?.recipient?.username) {
        delete message?.recipient?.profile;
        delete message?.recipient?.username;
        delete message?.recipient?.phoneNumber;
      }

      if (message?.sender?.username) {
        delete message?.recipient?.profile;
        delete message?.recipient?.username;
        delete message?.recipient?.phoneNumber;
      }

      if (message.timestamp) delete message.timestamp;

      delete message._id;

      let finalRoom;

      if (receiverId) {
        finalRoom = `${userId}-${receiverId}`;
      } else {
        finalRoom = room;
      }

      message.room = finalRoom;

      message.sender = userId;
      message.recipient = room;

      message.isForwarded = true;

      message.content = encrypt(message.content);

      const forwardedMessage = await MessageModel.create(message);
      io.emit("messages:forwardMessageResponse", forwardedMessage);

      // io.to(finalRoom).emit("forwardMessageResponse", forwardedMessage);
    } catch (error) {
      console.error("Error sending message:", { message: error });
    }
  });

  socket.on("messages:saveMessage", async (messageData) => {
    try {
      const { receiverId, message } = messageData;

      if (message.sender) {
        delete message.sender.profile;
        delete message.sender.username;
        delete message.sender.phoneNumber;
      }
      if (message._id) delete message._id;
      if (message.timestamp) delete message.timestamp;

      message.recipient = receiverId;

      message.room = receiverId + "-" + receiverId;

      const savedMessage = await MessageModel.create(message);

      io.emit("messages:saveMessageResponse", {
        data: savedMessage,
      });
    } catch (error) {
      console.error("Error sending message:", { message: error });
    }
  });

  socket.on(
    "messages:deleteMessage",
    async ({ messageId, deleteForEveryone }) => {
      try {
        if (deleteForEveryone) {
          const result = await MessageModel.updateOne(
            { _id: messageId },
            { isDeleted: true }
          );

          if (result.modifiedCount > 0) {
            io.emit("messages:deleteMessageResponse", {
              success: true,
              messageId,
              deletedByEveryone: true,
            });
          } else {
            io.emit("messages:deleteMessageResponse", {
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
            io.emit("messages:deleteMessageResponse", {
              success: true,
              messageId,
              deletedBy: userId,
            });
          } else {
            io.emit("messages:deleteMessageResponse", {
              success: false,
              error: "Message not found or already deleted for this user.",
            });
          }
        }
      } catch (err: any) {
        io.emit("messages:deleteMessageResponse", {
          success: false,
          error: err.message,
        });
      }
    }
  );

  socket.on(
    "messages:getHistory",
    async ({ name, page = 0, pageSize = 25 }) => {
      try {
        // const userId = socket.handshake.query.userId;
        const ids = !name?._id ? name?.split("-") : name?._id;

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
              { sender: senderObjectId, recipient: recipientObjectId },
              { sender: recipientObjectId, recipient: senderObjectId },
              { room: isSaveMessage && name },
            ],
            isDeleted: false,
            deletedBy: { $not: { $elemMatch: { $eq: userId } } },
          })
            .populate("sender", "username profile phoneNumber")
            .populate("recipient", "username profile phoneNumber")
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
            .sort({ timestamp: -1 })
            .skip(page * pageSize)
            .limit(pageSize)
            .lean();
        } else {
          history = await MessageModel.find({
            room: name,
            isDeleted: false,
            deletedBy: { $not: { $elemMatch: { $eq: userId } } },
          })
            .populate("sender", "username profile phoneNumber")
            .populate("recipient", "username profile phoneNumber")
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
            .sort({ timestamp: -1 })
            .skip(page * pageSize)
            .limit(pageSize)
            .lean();
        }

        // Decrypt message content for each history item
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

          // Check if file exists for fileUrl and voiceUrl
          if (message.fileUrl) {
            const filePath = path.join(
              __dirname,
              "..",
              "..",
              typeof message.fileUrl == "string"
                ? message.fileUrl
                : message.fileUrl.filePath
            );
            if (!fs.existsSync(filePath)) {
              message.fileUrl = ".404";
            }
          }

          if (message.voiceUrl) {
            const voicePath = path.join(
              __dirname,
              "..",
              "..",
              typeof message.voiceUrl == "string"
                ? message.voiceUrl
                : message.voiceUrl.filePath
            );
            if (!fs.existsSync(voicePath)) {
              message.voiceUrl = ".404";
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

        socket.emit("messages:sendHistory", decryptedHistory?.reverse());
      } catch (error) {
        console.error("Error fetching chat history:", error);
        socket.emit("messages:sendHistory", []);
      }
    }
  );
};
