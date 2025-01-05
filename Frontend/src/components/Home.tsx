import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import "./Home.css";
import { IoMdSettings } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import { Sender, Recipient, Message, Room } from "../modules/types/types";
import OnlineUsers from "../modules/OnlineUsers";
import OfflineUsers from "../modules/OfflineUsers";
import ChatArea from "../modules/ChatArea";
import checkPageStatus from "../shared/notifications";
import ErrorHandler from "./ErrorHandler";

interface DeleteMessageResponse {
  success: boolean;
  messageId: string;
  error?: string;
  deletedBy?: string[];
  deletedByEveryone?: boolean;
}

interface MessageSeenData {
  messages: string[];
}

interface VoiceMessageResponse {
  _id: string;
  content: string;
  // ... add other necessary properties
}

const Home: React.FC = () => {
  const [sender, setSender] = useState<Sender | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [pinMessage, setPinMessage] = useState<Message | null>(null);
  const [message, setMessage] = useState<string>("");
  const [publicName, setPublicName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Recipient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState<string | Room>("");
  const [shownRoomName, setShownRoomName] = useState<string>("No room joined");
  const [offlineUsers, setOfflineUsers] = useState<Recipient[]>([]);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/dashboard/whoami`, {
        withCredentials: true,
      })
      .then((res) => {
        setSender(res?.data);
        if (!res?.data.username) navigate("/settings");
        localStorage.setItem("userId", res?.data?._id ?? "");
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          navigate("/register");
        }
      });
  }, [navigate]);

  useEffect(() => {
    if (!sender) return;

    const socketInstance = io(`${import.meta.env.VITE_BACKEND_BASE_URL}`, {
      query: { userId: sender._id },
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [sender]);

  const createPrivateRoomId = (userId1: string, userId2: string) => {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}-${sortedIds[1]}`;
  };

  const joinRoom = (roomName: string | Room) => {
    setRecipient(null);
    setShownRoomName(
      typeof roomName === "string" ? roomName : roomName.roomName
    );
    setRoom(roomName);
    setPublicName(typeof roomName === "string" ? roomName : roomName.roomName);

    if (socket) {
      socket.emit(
        "joinRoom",
        typeof roomName === "string" ? roomName : roomName._id
      );
    }
  };

  const pvHandler = (user: Recipient) => {
    setShownRoomName("");
    setRecipient(user);

    const roomName = createPrivateRoomId(sender?._id ?? "", user._id);

    setRoom(roomName);

    setShownRoomName(
      sender?._id === user._id
        ? `Saved Messages (${user.username})`
        : user.username
        ? user.username
        : roomName
    );

    socket?.emit("joinRoom", roomName);
  };

  const settingHandler = () => {
    navigate("/settings");
  };

  useEffect(() => {
    const draft = localStorage.getItem("draftMessage");
    draft ? setMessage(draft) : setMessage("");
  }, [room]);

  useEffect(() => {
    if (room) {
      const formattedRoom = recipient?._id
      ? `${sender?._id}-${recipient?._id}`
      : typeof room === "object"
      ? room._id
      : "";

      socket?.emit("getHistory", { roomName: formattedRoom });

      setMessages([]);

      socket?.on("sendHistory", (messageData: Message[]) => {
        setMessages((prevMessages) => [...messageData, ...prevMessages]);
      });

      socket?.on(
        "deleteMessageResponse",
        ({
          success,
          messageId,
          error,
          deletedBy,
          deletedByEveryone,
        }: DeleteMessageResponse) => {
          if (success) {
            setMessages((prevMessages) =>
              prevMessages.filter((msg) => {
                const isCurrentMessage = msg._id === messageId;
                const isDeletedForEveryone = deletedByEveryone;
                const isDeletedForSender =
                  deletedBy && deletedBy.includes(sender?._id ?? "");

                if (isDeletedForEveryone && isCurrentMessage) {
                  return false;
                }

                return !isCurrentMessage || !isDeletedForSender;
              })
            );
          } else {
            console.error("Failed to delete message:", error);
          }
        }
      );

      // Declare observer outside of the 'if' block so it can be referenced in both observe and unobserve
      let observer: IntersectionObserver | null = null;
      const currentChatEnd = chatEndRef.current;

      if (currentChatEnd) {
        observer = new IntersectionObserver(
          (entries) => {
            const isAtBottom = entries[0].isIntersecting;

            if (isAtBottom && messages.length > 0) {
              // Emit the 'seen' event for all messages that are not 'seen'
              const unseenMessages = messages.filter(
                (message) => message.status !== "seen"
              );

              if (unseenMessages.length > 0) {
                socket?.emit("markMessagesAsSeen", {
                  messages: unseenMessages.map((msg) => msg._id),
                  room,
                  userId: sender?._id, // Current user marking messages as seen
                });
              }
            }
          },
          { threshold: 1.0 } // Adjust threshold based on when the element is considered in view
        );

        observer.observe(currentChatEnd);
      }

      return () => {
        socket?.off("deleteMessageResponse");
        socket?.off("sendHistory");
        socket?.off("newRoomResponse");
        socket?.off("message");

        if (observer && currentChatEnd) {
          observer.unobserve(currentChatEnd);
        }
      };
    }
  }, [room, socket]);

  socket?.on("message", (messageData: Message) => {
    setMessages((prevMessages) => {
      const currentRoomId = typeof room === "string" ? room : room?._id;
      const messageRoomId = messageData.room;

      if (messageRoomId !== currentRoomId) {
        return prevMessages;
      }

      const updatedMessages = prevMessages.map((msg) =>
        msg.tempId === messageData.tempId ? messageData : msg
      );

      if (!updatedMessages.some((msg) => msg._id === messageData._id)) {
        updatedMessages.push(messageData);
      }

      if (recipient && sender?._id !== messageData?.recipient?._id) {
        checkPageStatus(messageData.content, messageData.sender ?? "");
      }

      return updatedMessages;
    });
  });

  socket?.on("newRoomResponse", (roomData: Room[]) => {
    const userRooms = roomData.filter((room) =>
      room.participants.some(
        (participant) => participant.user.toString() === sender?._id
      )
    );

    if (userRooms.length > 0) {
      setRooms(() => [...userRooms]);
    }
  });

  useEffect(() => {
    const handleVoiceMessageResponse = (messageData: VoiceMessageResponse) => {
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(
          (msg) => msg._id === messageData._id
        );
        if (!messageExists) {
          return [...prevMessages, messageData as Message];
        }
        return prevMessages;
      });
    };

    socket?.on("fileUpload-respond", (messageData: Message) => {
      console.log(messageData);
      
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    socket?.on("editMessageResponse", (messageData: Message) => {
      setEditMessage(null);
      console.log(messageData);

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageData._id ? messageData : msg
        )
      );
    });

    socket?.on("forwardMessageResponse", (messageData: Message) => {
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(
          (msg) => msg._id === messageData._id
        );
        if (messageExists) {
          return [...prevMessages, messageData];
        }
        return prevMessages;
      });
    });

    socket?.on("voice-message-response", handleVoiceMessageResponse);

    socket?.on("editRoomResponse", (updatedRoom: Room) => {
      setRooms((prevRooms) =>
        prevRooms.map((proom) =>
          proom._id === updatedRoom._id ? updatedRoom : proom
        )
      );
    });

    socket?.on("messageSeen", (data: MessageSeenData) => {
      const { messages } = data;

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          messages.includes(msg._id ?? "") ? { ...msg, status: "seen" } : msg
        )
      );
    });

    return () => {
      socket?.off("messageSeen");
      socket?.off("voice-message-response", handleVoiceMessageResponse);
      socket?.off("fileUpload-respond");
      socket?.off("forwardMessageResponse");
      socket?.off("editMessageResponse");
      socket?.off("editRoomResponse");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("error", (error: string) => {
      ErrorHandler(error);
    });

    socket.on("onlineUsers", (users: Recipient[]) => {
      setOnlineUsers(users);
    });

    socket.on("offlineUsers", (users: Recipient[]) => {
      setOfflineUsers(users);
    });

    return () => {
      socket.off("error");
      socket.off("onlineUsers");
      socket.off("offlineUsers");
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.emit("login", sender?._id);

      socket.on("userRooms", (rooms: Room[]) => {
        setRooms(rooms);
      });

      const handleRemoveUserResponse = (data: {
        userId: string;
        updatedRoom: Room;
      }) => {
        setRooms((prevRooms) =>
          prevRooms.map((room) => {
            if (room?._id === data?.updatedRoom?._id) {
              const updatedParticipants = room.participants.filter(
                (participant) => participant.user.toString() !== data.userId
              );
              return { ...room, participants: updatedParticipants };
            }
            return room;
          })
        );
      };

      socket.on("removeUserResponse", handleRemoveUserResponse);

      return () => {
        socket.off("userRooms");
        socket.off("removeUserResponse", handleRemoveUserResponse);
      };
    }
  }, [socket, sender?._id]);

  const addRoomHandler = () => {
    const roomName = prompt("What is the name of the room?");
    if (roomName?.trim()) {
      if (roomName.length > 15) {
        alert("Use less then 15 charecters");
        return;
      }
      socket?.emit("newRoom", {
        roomName,
        senderId: sender?._id,
        isGroup: true,
        userId: sender?._id,
      });
    } else {
      alert("please write something down...");
    }
  };

  return (
    <div className="chat-container">
      <div className="sidebar" style={{ fontFamily: "Poppins" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Chat Rooms</h2>
          <div
            onClick={settingHandler}
            style={{ cursor: "pointer", boxSizing: "border-box" }}
          >
            <IoMdSettings size={30} />
          </div>
        </div>

        {rooms.map((room: Room) => (
          <button
            key={room._id}
            onClick={() => joinRoom(room)}
            className="room-btn"
          >
            {room.roomName}
          </button>
        ))}

        <button onClick={addRoomHandler} className="add-room-btn">
          <FaPlus />
          Add a Room
        </button>

        <div>
          <h2 style={{ marginTop: "20px", fontSize: "1.2rem" }}>
            Online Users
          </h2>

          <OnlineUsers
            onlineUsers={onlineUsers}
            pvHandler={pvHandler}
            sender={sender}
          />

          <OfflineUsers offlineUsers={offlineUsers} pvHandler={pvHandler} />
        </div>
      </div>

      <ChatArea
        message={message}
        setMessage={setMessage}
        setMessages={setMessages}
        messages={messages}
        shownRoomName={shownRoomName}
        setShownRoomName={setShownRoomName}
        room={room}
        recipient={recipient}
        sender={sender}
        socket={socket}
        onlineUsers={onlineUsers}
        setOnlineUsers={setOnlineUsers}
        offlineUsers={offlineUsers}
        setOfflineUsers={setOfflineUsers}
        publicName={publicName}
        setRooms={setRooms}
        setRoom={setRoom}
        pinMessage={pinMessage}
        setPinMessage={setPinMessage}
        editMessage={editMessage}
        setEditMessage={setEditMessage}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
        rooms={rooms}
        chatEndRef={chatEndRef}
      />
    </div>
  );
};

export default Home;
