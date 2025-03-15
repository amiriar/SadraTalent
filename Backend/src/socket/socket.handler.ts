import { Server, Socket } from "socket.io";
import { createPublicRooms } from "@/common/helper/Helper";
import { userEvents } from "./events/UserEvents";
import { messagesEvents } from "./events/MessagesEvents";
import { roomsEvents } from "./events/RoomsEvents";
import { storiesEvents } from "./events/StoriesEvents";
import { uploadEvents } from "./events/UploadEvents";
import { chatEvents } from "./events/ChatsEvents";

export const handleSocketConnections = (io: Server) => {
  const onlineUsers = new Map();
  io.on("connection", async (socket: Socket) => {
    console.log(`New user connected: ${socket.id}`);

    const userId = socket.handshake.query.userId as string;
    onlineUsers.set(userId, socket.id);

    if (!userId) {
      socket.disconnect();
      return;
    }

    createPublicRooms();

    const eventHandlers = [
      userEvents, // ✅
      chatEvents, // ✅
      messagesEvents, // ✅
      roomsEvents, // ✅
      storiesEvents, // ✅
      uploadEvents, // ✅
    ];

    // remaining: error to userid and change rooms

    eventHandlers.forEach((handler) =>
      handler(socket, io, socket.id, userId, onlineUsers)
    );

    // const sendOfflineUsers = async (socket: Socket) => {
    //   const allUsers = await UserModel.find(
    //     {},
    //     "_id username profile lastSeen bio lastname firstname email stories"
    //   );

    //   const offlineUsers = allUsers.filter(
    //     (user: any) => !onlineUsers.has(user._id.toString())
    //   );

    //   socket.emit("offlineUsers", offlineUsers);
    // };

    // try {
    //   const user = await UserModel.findById(userId, {
    //     __v: 0,
    //     otp: 0,
    //     otpExpire: 0,
    //     refreshToken: 0,
    //     lastDateIn: 0,
    //   });

    //   if (user) {
    //     // onlineUsers.set(userId, user);
    //     // io.emit("onlineUsers", Array.from(onlineUsers.values()));
    //     // sendOfflineUsers(socket);
    //   }
    // } catch (error) {
    //   console.error("Error fetching user or updating online users:", error);
    // }

    // socket.on("getUserData", async ({ recipientId }) => {
    //   const recipient = await UserModel.findById(recipientId, {
    //     __v: 0,
    //     otp: 0,
    //     otpExpire: 0,
    //     refreshToken: 0,
    //     lastDateIn: 0,
    //   });
    //   io.emit("getUserDataResponse", recipient);
    // });

    // socket.on("getUsersData", async () => {
    //   const usersData = await UserModel.find(
    //     {},
    //     {
    //       __v: 0,
    //       otp: 0,
    //       otpExpire: 0,
    //       refreshToken: 0,
    //       lastDateIn: 0,
    //     }
    //   );
    //   io.emit("getUsersDataResponse", usersData);
    // });

    // socket.on("isTyping", (data) => {
    //   const { senderId, room, isTyping } = data;
    //   socket.to(room).emit("typing", { senderId, isTyping });
    // });

    // socket.on("disconnect", async () => {
    //   // const userId = socket.handshake.query.userId;
    //   const lastSeen = new Date();

    //   await UserModel.updateOne({ _id: userId }, { lastSeen });

    //   onlineUsers.delete(userId);
    //   io.emit("onlineUsers", Array.from(onlineUsers.values()));

    //   // sendOfflineUsers(socket);
    // });

    // socket.on("markMessagesAsSeen", async ({ messages, room, userId }) => {
    //   await MessageModel.updateMany(
    //     { _id: { $in: messages }, status: { $ne: "seen" } },
    //     { $set: { status: "seen" } }
    //   );

    //   io.to(room).emit("messageSeen", { messages, userId });
    // });

    // socket.on("joinRoom", async (data) => {
    //   const { userId, room } = data;

    //   if (!userId) {
    //     socket.join(room?._id);
    //   } else {
    //     const isUserInRoom = await RoomModel.findOne({
    //       _id: room._id,
    //       "participants.user": userId,
    //       isDeleted: false,
    //     }).lean();

    //     if (!isUserInRoom) {
    //       await RoomModel.updateOne(
    //         { _id: room._id },
    //         { $addToSet: { participants: { user: userId } } }
    //       ).lean();
    //     }

    //     const userRooms = await RoomModel.find({
    //       $or: [
    //         { isPublic: true },
    //         { "participants.user": userId },
    //         { isDeleted: false },
    //       ],
    //     })
    //       .select("_id name isGroup createdAt participants")
    //       .populate("participants.user", "username profile phoneNumber")
    //       .lean();

    //     io.emit("newRoomResponse", userRooms);
    //   }
    // });

    // socket.on("leaveRoom", async ({ room, sender }) => {
    //   try {
    //     socket.leave(room);

    //     const currentRoom = await RoomModel.findOneAndUpdate(
    //       { _id: room, isDeleted: false },
    //       { $pull: { participants: { user: sender } } },
    //       { new: true }
    //     ).lean();

    //     if (currentRoom && currentRoom.participants.length === 0) {
    //       await RoomModel.updateOne({ _id: room }, { isDeleted: true });
    //       console.log(
    //         `Room ${room} deleted as there were no participants left`
    //       );
    //     }

    //     const rooms = await RoomModel.find(
    //       { "participants.user": sender },
    //       { isDeleted: false }
    //     ).lean();

    //     socket.emit("leftRoom", rooms);
    //   } catch (error: any) {
    //     console.error("Error leaving room:", error);
    //     socket.emit("errorLeavingRoom", { room, error: error.message });
    //   }
    // });

    // socket.on("removeUser", async ({ senderId, userId, roomId }) => {
    //   try {
    //     // Fetch the room with populated participants
    //     const room = await RoomModel.findById(roomId, { isDeleted: false })
    //       .populate({
    //         path: "participants.user", // Assuming 'user' is a reference in the participants array
    //         select: "username profile role", // Only include necessary fields
    //       })
    //       .lean();

    //     if (!room) {
    //       socket.emit("error", "Room not found");
    //       return;
    //     }

    //     const sender = room.participants.find(
    //       // @ts-ignore
    //       (participant) => participant.user._id.toString() === senderId
    //     );

    //     if (!sender || (sender.role !== "admin" && sender.role !== "owner")) {
    //       socket.emit(
    //         "error",
    //         "Permission denied. Only admins or owners can remove users."
    //       );
    //       return;
    //     }

    //     const userInRoom = room.participants.find(
    //       // @ts-ignore
    //       (participant) => participant.user._id.toString() === userId
    //     );

    //     if (!userInRoom) {
    //       socket.emit("error", "User not found in this room");
    //       return;
    //     }

    //     // Remove the user from the participants array
    //     room.participants = room.participants.filter(
    //       // @ts-ignore
    //       (participant) => participant.user._id.toString() !== userId
    //     );

    //     // Save the updated room and populate participants
    //     const updatedRoom = await RoomModel.findByIdAndUpdate(
    //       roomId,
    //       { participants: room.participants },
    //       { new: true }
    //     )
    //       .populate({
    //         path: "participants.user",
    //         select: "username profile role",
    //       })
    //       .lean();

    //     io.to(roomId).emit("removeUserResponse", updatedRoom);

    //     console.log(`User ${userId} removed from room ${roomId}`);
    //   } catch (error: any) {
    //     socket.emit("error", error.message);
    //     console.log("Error removing user:", error);
    //   }
    // });

    // socket.on("promoteUser", async ({ senderId, userId, roomId, newRole }) => {
    //   try {
    //     // Fetch room with populated participants
    //     const room = await RoomModel.findById(roomId, { isDeleted: false })
    //       .populate({
    //         path: "participants.user", // assuming participants array has 'user' references
    //         select: "username profile role", // include only necessary fields
    //       })
    //       .lean();

    //     if (!room) {
    //       socket.emit("error", "Room not found");
    //       return;
    //     }

    //     const sender = room.participants.find(
    //       // @ts-ignore
    //       (participant) => participant.user._id.toString() === senderId
    //     );

    //     if (!sender || (sender.role !== "admin" && sender.role !== "owner")) {
    //       socket.emit(
    //         "error",
    //         "Permission denied. Only admins or owners can promote users."
    //       );
    //       return;
    //     }

    //     const userInRoom = room.participants.find(
    //       // @ts-ignore
    //       (participant) => participant.user._id.toString() === userId
    //     );

    //     if (!userInRoom) {
    //       socket.emit("error", "User not found in this room");
    //       return;
    //     }

    //     if (newRole === "owner") {
    //       socket.emit("error", "Cannot promote a user to owner.");
    //       return;
    //     }

    //     if (userInRoom.role === newRole) {
    //       socket.emit("error", `User is already a ${newRole}`);
    //       return;
    //     }

    //     // Update user's role
    //     userInRoom.role = newRole;

    //     // Save changes to the room
    //     const updatedRoom = await RoomModel.findByIdAndUpdate(
    //       roomId,
    //       { participants: room.participants },
    //       { new: true }
    //     )
    //       .populate({
    //         path: "participants.user",
    //         select: "username profile role",
    //       })
    //       .lean();

    //     io.to(roomId).emit("userPromoted", updatedRoom);

    //     console.log(`User ${userId} promoted to ${newRole} in room ${roomId}`);
    //   } catch (error: any) {
    //     socket.emit("error", error.message);
    //     console.log("Error promoting user:", error);
    //   }
    // });

    // socket.on("editRoom", async (data) => {
    //   try {
    //     const { room, ...updatedRoom } = data;

    //     const newRoom = await RoomModel.findByIdAndUpdate(
    //       room._id,
    //       {
    //         ...(updatedRoom.name && { name: updatedRoom.name }),
    //         ...(updatedRoom.bio && { bio: updatedRoom.bio }),
    //         ...(updatedRoom.hasOwnProperty("isGroup") && {
    //           isGroup: updatedRoom.isGroup,
    //         }),
    //       },
    //       { new: true }
    //     ).lean();

    //     if (!newRoom) {
    //       return socket.emit("roomEditError", { message: "Room not found" });
    //     }

    //     io.to(room._id).emit("editRoomResponse", newRoom);
    //   } catch (error) {
    //     console.error("Error editing room:", error);
    //     socket.emit("roomEditError", { message: "Failed to edit the room" });
    //   }
    // });

    // socket.on("getRoomData", async (roomId: string) => {
    //   const room = await RoomModel.findById(roomId).populate(
    //     "participants.user",
    //     "username profile phoneNumber"
    //   );
    //   if (room) {
    //     socket.emit("getRoomDataResponse", room);
    //   } else {
    //     socket.emit("error", "Room Not Found");
    //   }
    // });

    // socket.on("getStories", async () => {
    //   try {
    //     const usersWithStories = await UserModel.find({
    //       stories: { $exists: true, $ne: null },
    //     })
    //       .populate({
    //         path: "stories",
    //         match: {
    //           expireAt: { $gt: new Date() },
    //           isDeleted: false,
    //         },
    //         select: "-__v",
    //       })
    //       .select("_id username profile stories")
    //       .lean();

    //     const response = usersWithStories
    //       .filter(
    //         (user) => Array.isArray(user.stories) && user.stories.length > 0
    //       )
    //       .map((user) => ({
    //         _id: user._id,
    //         username: user.username,
    //         profile: user.profile,
    //         // @ts-ignore
    //         stories: user?.stories?.map((story: IStory) => ({
    //           ...story,
    //           likesCount: story.likes.length,
    //         })),
    //       }));

    //     socket.emit("getStoriesResponse", response);
    //   } catch (error) {
    //     console.error("Error fetching user stories:", error);
    //     socket.emit("error", "Failed to fetch stories");
    //   }
    // });

    // socket.on("usersSeenStory",
    //   async ({ userId, storyId }: { userId: string; storyId: string }) => {
    //     try {
    //       const story = await StoryModel.findById(storyId)
    //         .populate({
    //           path: "seenBy",
    //           select: "_id username profile",
    //         })
    //         .populate({
    //           path: "likes",
    //           select: "_id username profile",
    //         });

    //       if (!story) {
    //         throw new Error("Story not found");
    //       }

    //       const filteredSeenBy = story.seenBy.filter(
    //         (user) => user._id.toString() !== userId
    //       );

    //       const filteredLikes = story.likes.filter(
    //         // @ts-ignore
    //         (user) => user._id.toString() !== userId
    //       );

    //       socket.emit("usersSeenStoryResponse", {
    //         seenBy: filteredSeenBy,
    //         likes: filteredLikes,
    //       });
    //     } catch (error) {
    //       console.error("Error fetching user stories:", error);
    //       socket.emit("error", "Failed to fetch stories");
    //     }
    //   }
    // );

    // socket.on("addStory",
    //   async ({ newDescription, newFilePath, newThumbnailPath, hyperLink }) => {
    //     try {
    //       const story = new StoryModel({
    //         description: newDescription,
    //         file: newFilePath,
    //         thumbnail: newThumbnailPath,
    //         hyperLink: hyperLink,
    //         user: userId,
    //         isDeleted: false,
    //         expireAt: new Date(new Date().setHours(new Date().getHours() + 24)),
    //       });
    //       await story.save();

    //       await UserModel.findByIdAndUpdate(userId, {
    //         $addToSet: { stories: story._id },
    //       });

    //       const usersWithStories = await UserModel.find({
    //         stories: { $exists: true, $ne: null },
    //       })
    //         .populate({
    //           path: "stories",
    //           match: {
    //             expireAt: { $gt: new Date() },
    //             isDeleted: false,
    //           },
    //           select: "-__v",
    //         })
    //         .select("_id username profile stories")
    //         .lean();

    //       const response = usersWithStories
    //         .filter(
    //           (user) => Array.isArray(user.stories) && user.stories.length > 0
    //         )
    //         .map((user) => ({
    //           _id: user._id,
    //           username: user.username,
    //           profile: user.profile,
    //           stories: user.stories,
    //         }));

    //       socket.broadcast.volatile.emit("getStoriesResponse", response);
    //     } catch (error) {
    //       console.error("Error adding story:", error);
    //       socket.emit("error", "Failed to add story");
    //     }
    //   }
    // );

    // socket.on("seenStory",
    //   async ({ userId, storyId }: { userId: string; storyId: string }) => {
    //     try {
    //       await StoryModel.findByIdAndUpdate(storyId, {
    //         $addToSet: { seenBy: userId },
    //       });
    //     } catch (error) {
    //       console.error("Error marking story as seen:", error);
    //       socket.emit("error", "Failed to mark story as seen");
    //     }
    //   }
    // );

    // socket.on("toggleLikeStory",
    //   async ({ userId, storyId }: { userId: string; storyId: string }) => {
    //     try {
    //       const story = await StoryModel.findById(storyId);
    //       // @ts-ignore
    //       if (story?.likes.includes(userId)) {
    //         await StoryModel.findByIdAndUpdate(storyId, {
    //           $pull: { likes: userId },
    //         });
    //         const updatedStory = await StoryModel.findById(storyId);
    //         socket.emit("toggleLikeStory", {
    //           storyId,
    //           success: true,
    //           likes: updatedStory?.likes,
    //         });
    //       } else {
    //         await StoryModel.findByIdAndUpdate(storyId, {
    //           $addToSet: { likes: userId },
    //         });
    //         const updatedStory = await StoryModel.findById(storyId);
    //         socket.emit("toggleLikeStory", {
    //           storyId,
    //           success: true,
    //           likes: updatedStory?.likes,
    //         });
    //       }
    //     } catch (error) {
    //       console.error("Error toggling like story:", error);
    //       socket.emit("error", "Failed to toggle like story");
    //     }
    //   }
    // );

    // socket.on("shareStory",
    //   async ({
    //     senderId,
    //     recipientId,
    //     storyId,
    //   }: {
    //     senderId: string;
    //     recipientId: string;
    //     storyId: string;
    //   }) => {
    //     try {
    //       const message = new MessageModel({
    //         sender: senderId,
    //         recipient: recipientId,
    //         room: senderId + "-" + recipientId,
    //         storyId: storyId,
    //       });
    //       await message.save();
    //       const populatedMessage = await message.populate(
    //         "storyId",
    //         "description file thumbnail hyperLink user expireAt"
    //       );
    //       socket.emit("shareStoryResponse", populatedMessage);
    //     } catch (error) {
    //       console.error("Error sharing story:", error);
    //       socket.emit("error", "Failed to share story");
    //     }
    //   }
    // );

    // socket.on("deleteStory", async (storyId: { storyId: string }) => {
    //   try {
    //     const story = await StoryModel.findByIdAndUpdate(storyId.storyId, {
    //       isDeleted: true,
    //     });
    //     if (story) {
    //       socket.emit("deleteStoryResponse", {
    //         storyId,
    //         message: "Story deleted successfully",
    //       });
    //     } else {
    //       socket.emit("error", "Failed to delete story");
    //     }
    //   } catch (error) {
    //     console.error("Error deleting story:", error);
    //     socket.emit("error", "Failed to delete story");
    //   }
    // });

    // socket.on("pinMessage", async ({ room, messageId }: any) => {
    //   try {
    //     await MessageModel.updateMany(
    //       { room, isPinned: true },
    //       { $set: { isPinned: false } }
    //     );

    //     const result = await MessageModel.findOneAndUpdate(
    //       { _id: messageId, room },
    //       { $set: { isPinned: true } },
    //       { new: true }
    //     ).populate("sender", "username");

    //     if (result) {
    //       io.to(room).emit("pinMessageResponse", { room, message: result });
    //     } else {
    //       socket.emit("error", { error: "Failed to pin the message" });
    //     }
    //   } catch (error) {
    //     console.error("Error pinning message:", error);
    //     socket.emit("error", { error: "Failed to pin the message" });
    //   }
    // });

    // socket.on("unpinMessage", async ({ room, messageId }: any) => {
    //   try {
    //     const result = await MessageModel.findOneAndUpdate(
    //       { _id: messageId, room },
    //       { $set: { isPinned: false } },
    //       { new: true }
    //     ).populate("sender", "username");

    //     if (result) {
    //       io.to(room).emit("unpinMessageResponse", { room, message: result });
    //     } else {
    //       socket.emit("error", { error: "Failed to unpin the message" });
    //     }
    //   } catch (error) {
    //     console.error("Error unpinning message:", error);
    //     socket.emit("error", { error: "Failed to unpin the message" });
    //   }
    // });

    // socket.on("editMessage", async (data) => {
    //   const { messageData } = data;
    //   const encryptedContent = encrypt(messageData.content);

    //   const newMessage = await MessageModel.findOneAndUpdate(
    //     { _id: messageData._id },
    //     { isEdited: true, content: encryptedContent },
    //     { new: true }
    //   )
    //     .populate("sender", "_id username profile")
    //     .populate({
    //       path: "replyTo",
    //       populate: {
    //         path: "sender",
    //         select: "username profile",
    //       },
    //     });

    //   let replyToContent = null;
    //   if (newMessage?.replyTo) {
    //     // @ts-ignore
    //     const decryptedReplyContent = decrypt(newMessage.replyTo.content);
    //     replyToContent =
    //       decryptedReplyContent.length > 50
    //         ? decryptedReplyContent.substring(0, 50) + "..."
    //         : decryptedReplyContent;
    //   }

    //   const decryptedMessage = {
    //     ...newMessage?.toObject(),
    //     content: decrypt(newMessage?.content ?? ""),
    //     replyTo: newMessage?.replyTo
    //       ? // @ts-ignore
    //         { ...newMessage.replyTo, content: replyToContent }
    //       : null,
    //   };

    //   socket.emit("editMessageResponse", decryptedMessage);
    // });

    // socket.on("getHistory", async ({ name, page = 0, pageSize = 25 }) => {
    //   try {
    //     // const userId = socket.handshake.query.userId;
    //     const ids = !name?._id ? name?.split("-") : name?._id;

    //     const isPrivateChat =
    //       ids?.length === 2 &&
    //       ids?.every((id: string) => mongoose.Types.ObjectId.isValid(id));

    //     let history = [];

    //     if (isPrivateChat) {
    //       const [senderId, recipientId] = ids;
    //       const isSaveMessage = senderId === recipientId;
    //       const senderObjectId = new mongoose.Types.ObjectId(senderId);
    //       const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

    //       history = await MessageModel.find({
    //         $or: [
    //           { sender: senderObjectId, recipient: recipientObjectId },
    //           { sender: recipientObjectId, recipient: senderObjectId },
    //           { room: isSaveMessage && name },
    //         ],
    //         isDeleted: false,
    //         deletedBy: { $not: { $elemMatch: { $eq: userId } } },
    //       })
    //         .populate("sender", "username profile phoneNumber")
    //         .populate("recipient", "username profile phoneNumber")
    //         .populate({
    //           path: "replyTo",
    //           populate: {
    //             path: "sender",
    //             select: "username profile",
    //           },
    //         })
    //         .populate({
    //           path: "storyId",
    //           select:
    //             "description file thumbnail hyperLink user isDeleted expireAt seenBy likes isAccepted",
    //         })
    //         .sort({ timestamp: -1 })
    //         .skip(page * pageSize)
    //         .limit(pageSize)
    //         .lean();
    //     } else {
    //       history = await MessageModel.find({
    //         room: name,
    //         isDeleted: false,
    //         deletedBy: { $not: { $elemMatch: { $eq: userId } } },
    //       })
    //         .populate("sender", "username profile phoneNumber")
    //         .populate("recipient", "username profile phoneNumber")
    //         .populate({
    //           path: "replyTo",
    //           populate: {
    //             path: "sender",
    //             select: "username profile",
    //           },
    //         })
    //         .populate({
    //           path: "storyId",
    //           select:
    //             "description file thumbnail hyperLink user isDeleted expireAt seenBy likes isAccepted",
    //         })
    //         .sort({ timestamp: -1 })
    //         .skip(page * pageSize)
    //         .limit(pageSize)
    //         .lean();
    //     }

    //     // Decrypt message content for each history item
    //     const decryptedHistory = history.map((message) => {
    //       const decryptedContent = decrypt(message.content);
    //       let replyToContent = null;

    //       if (message.replyTo) {
    //         // @ts-ignore
    //         const decryptedReplyContent = decrypt(message.replyTo.content);
    //         replyToContent =
    //           decryptedReplyContent.length > 50
    //             ? decryptedReplyContent.substring(0, 50) + "..."
    //             : decryptedReplyContent;
    //       }

    //       // Check if file exists for fileUrl and voiceUrl
    //       if (message.fileUrl) {
    //         const filePath = path.join(__dirname, "..", "..", message.fileUrl);
    //         if (!fs.existsSync(filePath)) {
    //           message.fileUrl = ".404";
    //         }
    //       }

    //       if (message.voiceUrl) {
    //         const voicePath = path.join(
    //           __dirname,
    //           "..",
    //           "..",
    //           message.voiceUrl
    //         );
    //         if (!fs.existsSync(voicePath)) {
    //           message.voiceUrl = ".404";
    //         }
    //       }

    //       return {
    //         ...message,
    //         content: decryptedContent,
    //         replyTo: message.replyTo
    //           ? // @ts-ignore
    //             { ...message.replyTo, content: replyToContent }
    //           : null,
    //       };
    //     });

    //     socket.emit("sendHistory", decryptedHistory?.reverse());
    //   } catch (error) {
    //     console.error("Error fetching chat history:", error);
    //     socket.emit("sendHistory", []);
    //   }
    // });

    // socket.on("sendMessage", async (messageData) => {
    //   try {
    //     const { tempId, content, ...rest } = messageData;

    //     // Encrypt the message content before saving
    //     const encryptedContent = encrypt(content);

    //     // Save the encrypted message to the database
    //     const newMessage = await MessageModel.create({
    //       ...rest,
    //       content: encryptedContent,
    //     });

    //     // Prepare message to send, decrypting for the frontend
    //     const sender = await UserModel.findById(
    //       newMessage.sender,
    //       "username profile"
    //     );
    //     const recipient = await UserModel.findById(
    //       newMessage.recipient,
    //       "username profile"
    //     );
    //     const decryptedContent = decrypt(newMessage.content);

    //     const replyToMessage = newMessage.replyTo
    //       ? await MessageModel.findById(newMessage.replyTo).populate({
    //           path: "sender",
    //           select: "username profile",
    //         })
    //       : null;

    //     const messageToSend = {
    //       _id: newMessage._id,
    //       tempId,
    //       content: decryptedContent,
    //       room: newMessage.room,
    //       timestamp: newMessage.timestamp,
    //       status: newMessage.status,
    //       isSending: false,
    //       voiceUrl: newMessage.voiceUrl,
    //       replyTo: replyToMessage
    //         ? {
    //             _id: replyToMessage._id,
    //             content: decrypt(replyToMessage.content), // Decrypt reply content
    //             timestamp: replyToMessage.timestamp,
    //             sender: {
    //               _id: replyToMessage.sender._id,
    //               username: replyToMessage.sender.username,
    //               profile: replyToMessage.sender.profile,
    //             },
    //             fileUrl: replyToMessage.fileUrl || null,
    //             voiceUrl: replyToMessage.voiceUrl || null,
    //           }
    //         : null,
    //       sender: {
    //         _id: sender?._id,
    //         username: sender?.username,
    //         profile: sender?.profile,
    //       },
    //       recipient: recipient
    //         ? {
    //             _id: recipient._id,
    //             username: recipient.username,
    //             profile: recipient.profile,
    //           }
    //         : null,
    //     };

    //     io.emit("message", messageToSend);
    //   } catch (error) {
    //     console.error("Error sending message:", error);
    //   }
    // });

    // socket.on("forwardMessage", async (messageData) => {
    //   try {
    //     const { message, room, senderId, recipientId } = messageData;

    //     if (message.replyTo) message.replyTo = message.replyTo._id;

    //     if (message?.recipient?.username) {
    //       delete message?.recipient?.profile;
    //       delete message?.recipient?.username;
    //       delete message?.recipient?.phoneNumber;
    //     }

    //     if (message?.sender?.username) {
    //       delete message?.recipient?.profile;
    //       delete message?.recipient?.username;
    //       delete message?.recipient?.phoneNumber;
    //     }

    //     if (message.timestamp) delete message.timestamp;

    //     delete message._id;

    //     let finalRoom;

    //     if (recipientId) {
    //       finalRoom = `${senderId}-${recipientId}`;
    //     } else {
    //       finalRoom = room;
    //     }

    //     message.room = finalRoom;

    //     message.sender = senderId;
    //     message.recipient = room;

    //     message.isForwarded = true;

    //     message.content = encrypt(message.content);

    //     const forwardedMessage = await MessageModel.create(message);
    //     io.emit("forwardMessageResponse", forwardedMessage);

    //     // io.to(finalRoom).emit("forwardMessageResponse", forwardedMessage);
    //   } catch (error) {
    //     console.error("Error sending message:", error);
    //   }
    // });

    // socket.on("saveMessage", async (messageData) => {
    //   try {
    //     const { recipientId, message } = messageData;

    //     if (message.sender) {
    //       delete message.sender.profile;
    //       delete message.sender.username;
    //       delete message.sender.phoneNumber;
    //     }
    //     if (message._id) delete message._id;
    //     if (message.timestamp) delete message.timestamp;

    //     message.recipient = recipientId;

    //     message.room = recipientId + "-" + recipientId;

    //     const savedMessage = await MessageModel.create(message);

    //     io.emit("saveMessageResponse", {
    //       data: savedMessage,
    //     });
    //   } catch (error) {
    //     console.error("Error sending message:", error);
    //   }
    // });

    // socket.on("deleteMessage",
    //   async ({ messageId, userId, deleteForEveryone }) => {
    //     try {
    //       if (deleteForEveryone) {
    //         const result = await MessageModel.updateOne(
    //           { _id: messageId },
    //           { isDeleted: true }
    //         );

    //         if (result.modifiedCount > 0) {
    //           io.emit("deleteMessageResponse", {
    //             success: true,
    //             messageId,
    //             deletedByEveryone: true,
    //           });
    //         } else {
    //           io.emit("deleteMessageResponse", {
    //             success: false,
    //             error: "Message not found or already deleted for everyone.",
    //           });
    //         }
    //       } else {
    //         const result = await MessageModel.updateOne(
    //           { _id: messageId },
    //           { $addToSet: { deletedBy: userId } }
    //         );

    //         if (result.modifiedCount > 0) {
    //           io.emit("deleteMessageResponse", {
    //             success: true,
    //             messageId,
    //             deletedBy: userId,
    //           });
    //         } else {
    //           io.emit("deleteMessageResponse", {
    //             success: false,
    //             error: "Message not found or already deleted for this user.",
    //           });
    //         }
    //       }
    //     } catch (err: any) {
    //       io.emit("deleteMessageResponse", {
    //         success: false,
    //         error: err.message,
    //       });
    //     }
    //   }
    // );

    // socket.on("newRoom", async (data: any) => {
    //   const { name, senderId, isGroup = true } = data;

    //   await RoomModel.create({
    //     name,
    //     participants: [{ user: senderId, role: "owner" }],
    //     isGroup: isGroup,
    //     isPublic: false,
    //   });

    //   const rooms = await RoomModel.find({
    //     $or: [
    //       { isPublic: true },
    //       { "participants.user": { $in: [senderId] } },
    //       { isDeleted: false },
    //     ],
    //   }).select("_id name isGroup createdAt participants");

    //   io.emit("newRoomResponse", rooms);
    // });

    // socket.on("promoteToAdmin", async ({ roomId, userId }) => {
    //   const room = await RoomModel.findById(roomId, { isDeleted: false });

    //   // @ts-ignore
    //   if (!room || room.owner.toString() !== userId) {
    //     return socket.emit("error", {
    //       message: "Only the owner can promote admins",
    //     });
    //   }
    //   const participant = room.participants.find(
    //     (p) => p.user.toString() === userId
    //   );

    //   if (!participant) {
    //     return socket.emit("error", {
    //       message: "User is not a participant in the room",
    //     });
    //   }

    //   participant.role = "admin";
    //   await room.save();

    //   io.to(roomId).emit("promoteToAdminResponse", room);
    // });

    // socket.on("login", async (userId: string) => {
    //   try {
    //     const user = await UserModel.findById(userId).select("_id username");

    //     if (!user) {
    //       return socket.emit("error", "User not found");
    //     }

    //     console.log(`User ${user.username} logged in`);

    //     const publicRooms = await RoomModel.find({
    //       name: { $in: ["General", "Announcements"] },
    //       isDeleted: false,
    //     })
    //       .select("_id name")
    //       .lean();

    //     for (const room of publicRooms) {
    //       socket.join(room._id.toString());

    //       const isUserAlreadyInRoom = await RoomModel.findOne({
    //         _id: room._id,
    //         "participants.user": user._id,
    //         isDeleted: false,
    //       });

    //       if (!isUserAlreadyInRoom) {
    //         await RoomModel.updateOne(
    //           { _id: room._id, isDeleted: false },
    //           {
    //             $addToSet: { participants: { user: user._id, role: "member" } },
    //           }
    //         ).lean();
    //       }

    //       console.log(`User ${user.username} joined ${room.name}`);
    //     }

    //     const userRooms = await RoomModel.find({
    //       $or: [
    //         { isPublic: true },
    //         { "participants.user": user._id },
    //         { isDeleted: false },
    //       ],
    //     })
    //       .select("_id name isGroup createdAt participants bio")
    //       .populate("participants.user", "username profile phoneNumber");

    //     userRooms.forEach((room: any) => {
    //       socket.join(room._id.toString());
    //     });

    //     socket.emit("userRooms", userRooms);
    //   } catch (err) {
    //     console.error("Error logging in user:", err);
    //     socket.emit("error", "Login failed");
    //   }
    // });

    // socket.on("voice-message", async (data: any) => {
    //   try {
    //     const { mp3Url, room, senderId } = data;

    //     if (!mp3Url || !room || !senderId) {
    //       throw new Error("Missing data");
    //     }

    //     const messageData = {
    //       voiceUrl: mp3Url,
    //       room: room._id ? room._id : room,
    //       sender: senderId,
    //     };

    //     const newMessage = await MessageModel.create(messageData);

    //     const sender = await UserModel.findById(
    //       newMessage.sender,
    //       "username profile"
    //     );
    //     const recipient = await UserModel.findById(
    //       newMessage.recipient,
    //       "username profile"
    //     );

    //     const messageToSend = {
    //       ...newMessage.toObject(),
    //       sender: {
    //         _id: sender?._id,
    //         username: sender?.username,
    //         profile: sender?.profile,
    //       },
    //       recipient: recipient
    //         ? {
    //             _id: recipient._id,
    //             username: recipient.username,
    //             profile: recipient.profile,
    //           }
    //         : null,
    //     };
    //     io.to(room._id ? room._id : room).emit(
    //       "voice-message-response",
    //       messageToSend
    //     );
    //   } catch (error) {
    //     console.error("Error processing voice message:", error);
    //   }
    // });

    // socket.on("fileUpload", async (data: any) => {
    //   try {
    //     const { fileUrl, sender, room, recipient } = data;

    //     if (!sender || !room || !fileUrl) {
    //       throw new Error("Missing data");
    //     }

    //     const messageData: any = {
    //       fileUrl,
    //       room: room._id ? room._id : room,
    //       sender: sender._id ? sender._id : sender,
    //     };

    //     if (recipient && recipient._id) {
    //       messageData.recipient = recipient._id;
    //     }

    //     const newMessage = await MessageModel.create(messageData);

    //     const Fullsender = await UserModel.findById(
    //       newMessage.sender,
    //       "username profile"
    //     );

    //     let Fullrecipient = null;
    //     if (newMessage.recipient) {
    //       Fullrecipient = await UserModel.findById(
    //         newMessage.recipient,
    //         "username profile"
    //       );
    //     }

    //     const messageToSend = {
    //       ...newMessage.toObject(),
    //       sender: {
    //         _id: Fullsender?._id,
    //         username: Fullsender?.username,
    //         profile: Fullsender?.profile,
    //       },
    //       recipient: Fullrecipient
    //         ? {
    //             _id: Fullrecipient._id,
    //             username: Fullrecipient.username,
    //             profile: Fullrecipient.profile,
    //           }
    //         : null,
    //     };

    //     // io.to(room._id ? room._id : room).emit(
    //     //   "fileUpload-respond",
    //     //   messageToSend
    //     // );
    //     io.emit("fileUpload-respond", messageToSend);
    //   } catch (error) {
    //     console.error("Error processing voice message:", error);
    //   }
    // });

    // socket.on("metadataReader", async ({ url, messageId }) => {
    //   try {
    //     const response = await fetch(url);
    //     const html = await response.text();

    //     const $ = cheerio.load(html);

    //     const metadata = {
    //       messageId,
    //       title:
    //         $('meta[property="og:title"]').attr("content") || $("title").text(),
    //       description:
    //         $('meta[property="og:description"]').attr("content") ||
    //         $('meta[name="description"]').attr("content"),
    //       image: $('meta[property="og:image"]').attr("content"),
    //       url: $('meta[property="og:url"]').attr("content") || url,
    //     };
    //     socket.emit("metadataReader-response", { metadata });
    //   } catch (error) {
    //     console.error("Error fetching metadata:", error);
    //     socket.emit("metadataReader-error", {
    //       error: "Failed to fetch metadata",
    //     });
    //   }
    // });
  });
};
