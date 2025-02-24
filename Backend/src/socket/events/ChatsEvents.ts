import UserModel from "@/api/admin/user/userSchema";
import { Socket, Server } from "socket.io";

export const chatEvents = (
  socket: Socket,
  io: Server,
  userSocketId: string,
  userId: string
) => {
  socket.on("chats:isTyping", (data) => {
    const { room, isTyping } = data;
    const userId = socket.handshake.query.userId;
    io.to(room).emit("chats:typing", { userId, isTyping });
  });
};
