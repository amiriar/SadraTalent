import MessageModel from "@/api/admin/messages/messagesSchema";
import RoomModel from "@/api/admin/rooms/roomsSchema";
import UserModel from "@/api/admin/user/userSchema";
import { decrypt } from "@/common/helper/Helper";
import { DefaultRoomNames } from "@/enum/PublicRooms";
import { Socket, Server } from "socket.io";

export const userEvents = (
  socket: Socket,
  io: Server,
  userSocketId: string,
  userId: string,
  onlineUsers: Map<string, any> = new Map()
) => {
  socket.on("users:login", async () => {
    try {
      const user = await UserModel.findById(userId).select(
        "_id username profile role"
      );
      if (!user) {
        return socket.emit("error", { message: "User not found" });
      }

      console.log(`✅ User ${user.username} logged in`);

      // Store user in onlineUsers map
      onlineUsers.set(userId, {
        _id: userId,
        socketId: socket.id,
        username: user.username,
        profile: user.profile,
      });

      // Fetch public rooms (General & Announcements)
      const publicRooms = await RoomModel.find({
        name: { $in: ["General", "Announcements"] },
        isDeleted: false,
      })
        .select("_id name")
        .lean();

      for (const room of publicRooms) {
        socket.join(room._id.toString());

        const isUserAlreadyInRoom = await RoomModel.findOne({
          _id: room._id,
          "participants.user": user._id,
          isDeleted: false,
        });

        if (!isUserAlreadyInRoom) {
          await RoomModel.updateOne(
            { _id: room._id, isDeleted: false },
            { $addToSet: { participants: { user: user._id, role: "member" } } }
          );
        }

        console.log(`✅ User ${user.username} joined ${room.name}`);
      }

      // Fetch all rooms the user is in
      const userRooms = await RoomModel.find({
        $or: [{ isPublic: true }, { "participants.user": user._id }],
        isDeleted: false,
      })
        .select("_id name isGroup createdAt participants bio")
        .populate("participants.user", "username profile phoneNumber")
        .lean();

      // Fetch and attach the last message for each room
      for (const room of userRooms) {
        const lastMessage = await MessageModel.findOne({
          room: room._id,
          isDeleted: false,
          deletedBy: { $not: { $elemMatch: { $eq: userId } } },
        })
          .sort({ createdAt: -1 })
          .select("_id sender content createdAt")
          .populate("sender", "username profile")
          .lean();

        if (lastMessage) {
          lastMessage.content = decrypt(lastMessage.content);
        }
        room.lastMessage = lastMessage || null;
      }

      // Join all rooms
      userRooms.forEach((room) => {
        socket.join(room._id.toString());
      });

      // Notify other users of online status
      await sendOnlineUsers();

      // Send rooms with the last message attached directly to each room object
      socket.emit("users:userRooms", userRooms);
    } catch (err) {
      console.error("❌ Error logging in user:", err);
      socket.emit("error", { message: "Login failed" });
    }
  });

  socket.on("disconnect", async () => {
    if (onlineUsers.has(userId)) {
      onlineUsers.delete(userId); 
    }

    const lastSeen = new Date();
    await UserModel.updateOne({ _id: userId }, { lastSeen });

    console.log(`❌ User ${userId} disconnected`);

    await sendOnlineUsers(); 
  });

  const getLastMessageBetweenUsers = async (
    userId1: string,
    userId2: string
  ) => {
    const lastMessage = await MessageModel.findOne({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
        // { room: isSaveMessage && roomName },
      ],
      isDeleted: false,
      deletedBy: { $not: { $elemMatch: { $eq: userId } } },
    })
      .select("_id sender content createdAt isDeleted deletedBy")
      .populate("sender", "username profile phoneNumber role")
      .sort({ createdAt: -1 });
          
    if (lastMessage) lastMessage.content = decrypt(lastMessage?.content);

    return lastMessage;
  };

  const sendOnlineUsers = async () => {
    try {
      const onlineUsersArray = await Promise.all(
        Array.from(onlineUsers.values()).map(async (user: any) => {
          const lastMessage = await getLastMessageBetweenUsers(
            userId,
            user._id
          );
          return { ...user, lastMessage };
        })
      );

      io.emit("users:onlineUsers", onlineUsersArray);
      await sendOfflineUsers();
    } catch (error) {
      console.error("❌ Error sending online users:", error);
    }
  };

  const sendOfflineUsers = async () => {
    const allUsers = await UserModel.find().select(
      "_id username profile lastSeen role"
    );

    const offlineUsersArray = await Promise.all(
      allUsers
        .filter((user: any) => !onlineUsers.has(user._id.toString()))
        .map(async (user: any) => {
          const lastMessage = await getLastMessageBetweenUsers(
            userId,
            user._id
          ); // userId is the logged-in user
          return { ...user.toObject(), lastMessage };
        })
    );

    io.emit("users:offlineUsers", offlineUsersArray);
  };

  socket.on("users:getUsers", async () => {
    const allUsers = await UserModel.find(
      // for now its gonna be all users, later we will filter by contacts
      {},
      "_id username profile lastSeen bio lastname firstname email stories role"
    );

    allUsers.forEach((user: any) => {
      user["userSocketId"] = userSocketId;
    });

    io.emit("users:getUsersResponse", allUsers);
  });

  socket.on("users:getUserData", async ({ recipientId }) => {
    const recipient = await UserModel.findById(recipientId, {
      __v: 0,
      otp: 0,
      otpExpire: 0,
      refreshToken: 0,
      lastDateIn: 0,
    });
    io.emit("users:getUserDataResponse", recipient);
  });
};
