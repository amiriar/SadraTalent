import RoomModel from "@/api/admin/rooms/roomsSchema";
import UserModel from "@/api/admin/user/userSchema";
import { Socket, Server } from "socket.io";

export const chatEvents = (
  socket: Socket,
  io: Server,
  userSocketId: string,
  userId: string,
  onlineUsers: Map<string, any> = new Map()
) => {
  socket.on("support:joinTopic", (data) => {
    const { topicId } = data;

    // fetch topics from abp backend
    // check if has online operators
    // if topic has online operators, make a room with the topic id and the user id and operator id and if not, return an error

    io.to(topicId).emit("support:joinTopicResponse", {
      userId,
      topicId,
    });
  });
};
