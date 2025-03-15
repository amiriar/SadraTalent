import RoomModel, { IRoom } from "@/api/admin/rooms/roomsSchema";
import UserModel, { IUser } from "@/api/admin/user/userSchema";
import { Socket, Server } from "socket.io";

export const roomsEvents = (
  socket: Socket,
  io: Server,
  userSocketId: string,
  userId: string,
  onlineUsers: Map<string, any> = new Map()
) => {
  socket.on("rooms:joinRoom", async (room: string) => {
    const isUserInRoom = await RoomModel.findOne({
      _id: room,
      "participants.user": userId,
      isDeleted: false,
    }).lean();

    if (!isUserInRoom) {
      await RoomModel.updateOne(
        { _id: room },
        { $addToSet: { participants: { user: userId } } }
      ).lean();
    }

    const userRooms = await RoomModel.find({
      $or: [
        { isPublic: true },
        { "participants.user": userId },
        { isDeleted: false },
      ],
    })
      .select("_id name isGroup createdAt participants")
      .populate("participants.user", "username profile phoneNumber")
      .lean();

    io.to(room).emit("rooms:newRoomResponse", userRooms);
  });

  socket.on(
    "rooms:leaveRoom",
    async ({ roomId, sender }: { roomId: string; sender: IUser }) => {
      try {
        socket.leave(roomId);

        const currentRoom = await RoomModel.findOneAndUpdate(
          { _id: roomId, isDeleted: false },
          { $pull: { participants: { user: sender } } },
          { new: true }
        ).lean();

        if (currentRoom && currentRoom.participants.length === 0) {
          await RoomModel.updateOne({ _id: roomId }, { isDeleted: true });
          console.log(
            `Room ${roomId} deleted as there were no participants left`
          );
        }

        const rooms = await RoomModel.find(
          { "participants.user": sender },
          { isDeleted: false }
        ).lean();

        socket.to([userId, roomId]).emit("rooms:leaveRoomResponse", rooms);
      } catch (error: any) {
        console.error("Error leaving room:", error);
        socket
          .to(userId)
          .emit("error", { message: `${error.message}, room: ${roomId}` });
      }
    }
  );

  socket.on("rooms:editRoom", async (data) => {
    try {
      const { roomId, ...updatedRoom } = data;

      const newRoom = await RoomModel.findByIdAndUpdate(
        roomId,
        {
          ...(updatedRoom.name && { name: updatedRoom.name }),
          ...(updatedRoom.bio && { bio: updatedRoom.bio }),
          ...(updatedRoom.hasOwnProperty("isGroup") && {
            isGroup: updatedRoom.isGroup,
          }),
        },
        { new: true }
      ).lean();

      if (!newRoom) {
        return socket.to(userId).emit("error", { message: "Room not found" });
      }

      io.to(roomId).emit("rooms:editRoomResponse", newRoom);
    } catch (error) {
      console.error("Error editing room:", error);
      socket.to(userId).emit("error", { message: "Failed to edit the room" });
    }
  });

  socket.on(
    "rooms:removeUser",
    async ({ senderId, roomId }: { senderId: string; roomId: string }) => {
      try {
        const room = await RoomModel.findById(roomId, { isDeleted: false })
          .populate({
            path: "participants.user",
            select: "username profile role",
          })
          .lean();

        if (!room) {
          socket.to(userId).emit("error", { message: "Room not found" });
          return;
        }

        const sender = room.participants.find(
          (participant) => participant.user._id.toString() === senderId
        );

        if (!sender || (sender.role !== "admin" && sender.role !== "owner")) {
          socket.to(userId).emit("error", {
            message:
              "Permission denied. Only admins or owners can remove users.",
          });
          return;
        }

        const userInRoom = room.participants.find(
          (participant) => participant.user._id.toString() === userId
        );

        if (!userInRoom) {
          socket
            .to(userId)
            .emit("error", { message: "User not found in this room" });
          return;
        }

        room.participants = room.participants.filter(
          (participant) => participant.user._id.toString() !== userId
        );

        const updatedRoom = await RoomModel.findByIdAndUpdate(
          roomId,
          { participants: room.participants },
          { new: true }
        )
          .populate({
            path: "participants.user",
            select: "username profile role",
          })
          .lean();

        io.to(roomId).emit("rooms:removeUserResponse", updatedRoom);

        console.log(`User ${userId} removed from room ${roomId}`);
      } catch (error: any) {
        socket.to(userId).emit("error", { message: error.message });
        console.log("Error removing user:", error);
      }
    }
  );

  socket.on(
    "rooms:promoteUser",
    async ({
      senderId,
      userId,
      roomId,
      newRole,
    }: {
      senderId: string;
      userId: string;
      roomId: string;
      newRole: any;
    }) => {
      try {
        const room = await RoomModel.findById(roomId, { isDeleted: false })
          .populate({
            path: "participants.user",
            select: "username profile role",
          })
          .lean();

        if (!room) {
          socket.to(userId).emit("error", { message: "Room not found" });
          return;
        }

        const sender = room.participants.find(
          (participant) => participant.user._id.toString() === senderId
        );

        if (!sender || (sender.role !== "admin" && sender.role !== "owner")) {
          socket.to(userId).emit("error", {
            message:
              "Permission denied. Only admins or owners can promote users.",
          });
          return;
        }

        const userInRoom = room.participants.find(
          (participant) => participant.user._id.toString() === userId
        );

        if (!userInRoom) {
          socket
            .to(userId)
            .emit("error", { message: "User not found in this room" });
          return;
        }

        if (newRole === "owner") {
          socket
            .to(userId)
            .emit("error", { message: "Cannot promote a user to owner." });
          return;
        }

        if (userInRoom.role === newRole) {
          socket
            .to(userId)
            .emit("error", { message: `User is already a ${newRole}` });
          return;
        }

        userInRoom.role = newRole;

        const updatedRoom = await RoomModel.findByIdAndUpdate(
          roomId,
          { participants: room.participants },
          { new: true }
        )
          .populate({
            path: "participants.user",
            select: "username profile role",
          })
          .lean();

        io.to(roomId).emit("rooms:userPromoted", updatedRoom);

        console.log(`User ${userId} promoted to ${newRole} in room ${roomId}`);
      } catch (error: any) {
        socket.to(userId).emit("error", { message: error.message });
        console.log("Error promoting user:", error);
      }
    }
  );

  socket.on("rooms:getRoomData", async (roomId: string) => {
    const room = await RoomModel.findById(roomId).populate(
      "participants.user",
      "username profile phoneNumber"
    );
    if (room) {
      socket.to(userId).emit("rooms:getRoomDataResponse", room);
    } else {
      socket.to(userId).emit("error", { message: "Room Not Found" });
    }
  });

  socket.on("rooms:newRoom", async (data: IRoom) => {
    const { name, isGroup = true } = data;

    await RoomModel.create({
      name,
      participants: [{ user: userId, role: "owner" }],
      isGroup: isGroup,
      isPublic: false,
    });

    const rooms = await RoomModel.find({
      $or: [
        { isPublic: true },
        { "participants.user": { $in: [userId] } },
        { isDeleted: false },
      ],
    }).select("_id name isGroup createdAt participants");

    io.to(userId).emit("rooms:newRoomResponse", rooms);
  });

  socket.on(
    "rooms:promoteToAdmin",
    async ({
      roomId,
      targetUserId,
    }: {
      roomId: string;
      targetUserId: string;
    }) => {
      const room = await RoomModel.findById(roomId, { isDeleted: false });

      if (!room) {
        return socket.to(userId).emit("error", {
          message: "Room Not Found",
        });
      }

      const participant = room.participants.find(
        (p) => p.user.toString() === targetUserId
      );

      if (!participant) {
        return socket.to(userId).emit("error", {
          message: "User is not a participant in the room",
        });
      }

      participant.role = "admin";
      await room.save();

      io.to(roomId).emit("rooms:promoteToAdminResponse", room);
    }
  );
};
