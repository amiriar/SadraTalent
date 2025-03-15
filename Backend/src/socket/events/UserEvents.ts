import MessageModel from "@/api/admin/messages/messagesSchema";
import RoomModel from "@/api/admin/rooms/roomsSchema";
import UserModel from "@/api/admin/user/userSchema";
import { decrypt } from "@/common/helper/Helper";
import { Status } from "@/common/utils/enum";
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
        return io.to(userId).emit("error", { message: "User not found" });
      }

      user.status = Status.online;
      user.save();

      console.log(`✅ User ${user.username} logged in`);

      onlineUsers.set(userId, {
        _id: userId,
        socketId: socket.id,
        username: user.username,
        profile: user.profile,
        role: user.role,
      });

      const allRooms = await RoomModel.find({
        isDeleted: false,
      })
        .select("_id name")
        .lean();

      for (const room of allRooms) {
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

      const userRooms = await RoomModel.find({
        $or: [{ isPublic: true }, { "participants.user": user._id }],
        isDeleted: false,
      })
        .select("_id name isGroup createdAt participants bio type")
        .populate("participants.user", "username profile phoneNumber")
        .lean();

      for (const room of userRooms) {
        socket.join(room._id.toString());
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

        // @ts-ignore
        room.lastMessage = lastMessage || null;
      }

      await sendOnlineUsers();

      socket.join(userId);

      io.to([...socket.rooms]).emit("users:userRooms", userRooms);
    } catch (err) {
      console.error("❌ Error logging in user:", err);
      io.to(userId).emit("error", { message: "Login failed" });
    }
  });

  socket.on("disconnect", async () => {
    if (onlineUsers.has(userId)) {
      onlineUsers.delete(userId);
    }

    const lastSeen = new Date();
    const t = await UserModel.updateOne(
      { _id: userId },
      { lastSeen, status: Status.offline }
    );

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

      io.to([...socket.rooms]).emit("users:onlineUsers", onlineUsersArray);
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
          );
          return { ...user.toObject(), lastMessage };
        })
    );

    io.to([...socket.rooms]).emit("users:offlineUsers", offlineUsersArray);
  };

  // unused
  socket.on("users:getUsers", async () => {
    const allUsers = await UserModel.find().select(
      "_id username profile lastSeen bio lastname firstname email stories role"
    );

    allUsers.forEach((user: any) => {
      user["userSocketId"] = userSocketId;
    });

    io.emit("users:getUsersResponse", allUsers);
  });
  // unused

  socket.on("users:getUserData", async ({ recipientId }) => {
    const recipient = await UserModel.findById(recipientId, {
      __v: 0,
      otp: 0,
      otpExpire: 0,
      refreshToken: 0,
      lastDateIn: 0,
    });
    io.to(userId).emit("users:getUserDataResponse", recipient);
  });
};
