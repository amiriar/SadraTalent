import RoomModel from "@/api/admin/rooms/roomsSchema";
import UserModel from "@/api/admin/user/userSchema";
import { DefaultRoomNames } from "@/enum/PublicRooms";
import { Socket, Server } from "socket.io";

export const userEvents = (
  socket: Socket,
  io: Server,
  userSocketId: string,
  userId: string
) => {
  const onlineUsers = new Map();

  socket.on("users:login", async () => {
    try {
      await sendOnlineUsers();
      
      const user = await UserModel.findById(userId).select("_id username");
      if (!user) {
        return socket.emit("error", { message: "User not found" });
      }

      console.log(`User ${user.username} logged in`);

      const publicRooms = await RoomModel.find({
        name: {
          $in: [DefaultRoomNames.General, DefaultRoomNames.Announcements],
        },
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
            {
              $addToSet: { participants: { user: user._id, role: "member" } },
            }
          ).lean();
        }

        console.log(`User ${user.username} joined ${room.name}`);
      }

      const userRooms = await RoomModel.find({
        $or: [
          { isPublic: true },
          { "participants.user": user._id },
          { isDeleted: false },
        ],
      })
        .select("_id name isGroup createdAt participants bio")
        .populate("participants.user", "username profile phoneNumber");

      userRooms.forEach((room: any) => {
        socket.join(room._id.toString());
      });

      socket.emit("users:userRooms", userRooms);
    } catch (err) {
      console.error("Error logging in user:", err);
      socket.emit("error", { message: "Login failed" });
    }
  });

  socket.on("users:disconnect", async () => {
    const lastSeen = new Date();

    await UserModel.updateOne({ _id: userId }, { lastSeen });

    socket.leave(userId as string); // mongo id
    socket.leave(userSocketId); // socket id

    const allUsers = await UserModel.find(
      // for now its gonna be all users, later we will filter by contacts
      {},
      "_id username profile lastSeen bio lastname firstname email stories"
    );

    allUsers.forEach((user: any) => {
      user["userSocketId"] = userSocketId;
    });

    io.emit("users:getUsersResponse", allUsers);
  });

  socket.on("users:getUsers", async () => {
    const allUsers = await UserModel.find(
      // for now its gonna be all users, later we will filter by contacts
      {},
      "_id username profile lastSeen bio lastname firstname email stories"
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

  const sendOfflineUsers = async (socket: Socket) => {
    const allUsers = await UserModel.find(
      {},
      "_id username profile lastSeen bio lastname firstname email stories"
    );

    const offlineUsers = allUsers.filter(
      (user: any) => !onlineUsers.has(user._id.toString())
    );

    socket.emit("users:offlineUsers", offlineUsers);
  };

  const sendOnlineUsers = async () => {
    try {
      const user = await UserModel.findById(userId, {
        __v: 0,
        otp: 0,
        otpExpire: 0,
        refreshToken: 0,
        lastDateIn: 0,
      });

      if (user) {
        onlineUsers.set(userId, user);
        io.emit("users:onlineUsers", Array.from(onlineUsers.values()));
        sendOfflineUsers(socket);
      }
    } catch (error) {
      console.error("Error fetching user or updating online users:", error);
    }
  };
};
