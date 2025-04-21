import MessageModel, { IMessage } from "@/api/admin/messages/messagesSchema";
import RoomModel from "@/api/admin/rooms/roomsSchema";
import UserModel from "@/api/admin/user/userSchema";
import { decrypt } from "@/common/helper/Helper";
import { RoomTypes, Status } from "@/common/utils/enum";
import { DefaultRoomNames } from "@/enum/PublicRooms";
import { Socket, Server } from "socket.io";

export const userEvents = (
  socket: Socket,
  io: Server,
  userSocketId: string,
  userId: string,
  onlineUsers: Map<string, any> = new Map()
) => {
  // socket.on("users:login", async () => {
  //   try {
  //     const user = await UserModel.findById(userId).select(
  //       "_id username profile role"
  //     );
  //     if (!user) {
  //       return io.to(userId).emit("error", { message: "User not found" });
  //     }

  //     user.status = Status.online;
  //     user.save();

  //     console.log(`✅ User ${user.username} logged in`);

  //     onlineUsers.set(userId, {
  //       _id: userId,
  //       socketId: socket.id,
  //       username: user.username,
  //       profile: user.profile,
  //       role: user.role,
  //     });

  //     const allRooms = await RoomModel.find({
  //       isDeleted: false,
  //     })
  //       .select("_id name")
  //       .lean();

  //     for (const room of allRooms) {
  //       socket.join(room._id.toString());

  //       const isUserAlreadyInRoom = await RoomModel.findOne({
  //         _id: room._id,
  //         "participants.user": user._id,
  //         isDeleted: false,
  //       });

  //       if (!isUserAlreadyInRoom) {
  //         await RoomModel.updateOne(
  //           { _id: room._id, isDeleted: false },
  //           { $addToSet: { participants: { user: user._id, role: "member" } } }
  //         );
  //       }

  //       console.log(`✅ User ${user.username} joined ${room.name}`);
  //     }

  //     let userRooms = await RoomModel.find({
  //       $or: [{ isPublic: true }, { "participants.user": user._id }],
  //       isDeleted: false,
  //     })
  //       .select("_id name isGroup createdAt participants bio type")
  //       .populate("participants.user", "username profile phoneNumber")
  //       .lean();

  //     for (const room of userRooms) {
  //       socket.join(room._id.toString());
  //       const lastMessage = await MessageModel.findOne({
  //         room: room._id,
  //         isDeleted: false,
  //         deletedBy: { $not: { $elemMatch: { $eq: userId } } },
  //       })
  //         .sort({ createdAt: -1 })
  //         .select("_id sender content createdAt")
  //         .populate("sender", "username profile")
  //         .lean();

  //       if (lastMessage) {
  //         lastMessage.content = decrypt(lastMessage.content);
  //       }

  //       // @ts-ignore
  //       room.lastMessage = lastMessage || null;
  //     }

  //     userRooms = userRooms.map((room) => {
  //       if (
  //         room.type === String(RoomTypes.Private) &&
  //         room.name.startsWith("PV:")
  //       ) {
  //         const ids = room.name.replace("PV:", "").split("-");
  //         const otherUserId = ids.find((id) => id !== userId); // Get the other participant

  //         if (otherUserId) {
  //           const otherUser = UserModel.findById(otherUserId).select(
  //             "_id username"
  //           );
  //           // const otherUser = room.participants.find(
  //           //   (p) => p.user._id.toString() === otherUserId
  //           // );
  //           if (otherUser) {
  //             // @ts-ignore
  //             room.name = otherUser.username;
  //           }
  //         }
  //       }
  //       return room;
  //     });

  //     console.log(userRooms);

  //     await sendAllUsers();

  //     socket.join(userId);

  //     io.to([...socket.rooms]).emit("users:userRooms", userRooms);
  //   } catch (err) {
  //     console.error("❌ Error logging in user:", err);
  //     io.to(userId).emit("error", { message: "Login failed" });
  //   }
  // });

  socket.on("users:login", async () => {
    try {
      const user = await UserModel.findById(userId).select(
        "_id username profile role"
      );
      if (!user) {
        return io.to(userId).emit("error", { message: "User not found" });
      }

      user.status = Status.online;
      await user.save();

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
        "participants.user": { $in: [userId] },
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

      let userRooms = await RoomModel.find({
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

      userRooms = await Promise.all(
        userRooms.map(async (room) => {
          if (
            room.type === String(RoomTypes.Private) &&
            room.name.startsWith("PV:")
          ) {
            const ids = room.name.replace("PV:", "").split("-");
            const otherUserId = ids.find((id) => id !== userId);

            if (otherUserId) {
              const otherUser = await UserModel.findById(otherUserId).select(
                "_id username"
              );
              if (otherUser) {
                // @ts-ignore
                room.name = otherUser.username;
              }
            }
          }
          return room;
        })
      );

      await sendAllUsers();

      socket.join(userId);

      // io.to([...socket.rooms]).emit("users:userRooms", userRooms);
      io.to(userId).emit("users:userRooms", userRooms);
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

    await sendAllUsers();
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

  const sendAllUsers = async () => {
    try {
      const allUsers = await UserModel.find().select(
        "_id username profile lastSeen role status"
      );

      const allUsersArray = await Promise.all(
        allUsers.map(async (user: any) => {
          const lastMessage = await getLastMessageBetweenUsers(
            userId,
            user._id
          );
          const userObj = user.toObject({ getters: true });

          return {
            _id: userObj._id.toString(),
            username: userObj.username,
            profile: userObj.profile,
            lastSeen: userObj.lastSeen,
            role: userObj.role,
            status: onlineUsers.has(userObj._id.toString())
              ? "online"
              : "offline",
            lastMessage: lastMessage
              ? {
                  // @ts-ignore
                  _id: lastMessage._id.toString(),
                  content: lastMessage.content,
                  sender: lastMessage.sender,
                  createdAt: lastMessage.createdAt,
                  isDeleted: lastMessage.isDeleted,
                  isDeletedForCurrentUser: lastMessage.deletedBy
                    ?.toString()
                    .includes(userId),
                }
              : null,
          };
        })
      );

      io.to([...socket.rooms]).emit("users:allUsers", allUsersArray);
    } catch (error) {
      console.error("❌ Error sending all users:", error);
    }
  };

  socket.on("users:getUserData", async ({ recipientId }) => {
    const recipient = await UserModel.findOne({
      _id: recipientId,
      isDeleted: { $ne: true },
    })
      .select(
        "-__v -otp -otpExpire -refreshToken -lastDateIn -createdAt -updatedAt -isDeleted"
      )
      .populate("profile", "username profile")
      .populate({
        path: "stories",
        match: { expireAt: { $gt: new Date() } },
        select:
          "description file thumbnail hyperLink isAccepted expireAt seenBy likes",
      })
      .lean();

    io.to(userId).emit("users:getUserDataResponse", recipient);
  });
};
