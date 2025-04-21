import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import "./Home.css";
import { FaPlus, FaPlusCircle } from "react-icons/fa";
import {
  Sender,
  Recipient,
  IMessage,
  Room,
  IStory,
} from "../modules/types/types";
import ChatArea from "../modules/ChatArea";
import checkPageStatus from "../shared/notifications";
import ErrorHandler from "./ErrorHandler";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { Avatar, Divider } from "@mui/material";
import Swal from "sweetalert2";
import StoryModal from "../modules/StoryModal";
import UsersModal from "../modules/UsersModal";
import CreateStoryModal from "./CreateStoryModal";
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
}

const Home: React.FC = () => {
  const [sender, setSender] = useState<Sender | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [pinMessage, setPinMessage] = useState<IMessage | null>(null);
  const [message, setMessage] = useState<string>("");
  const [publicName, setPublicName] = useState<string>("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [users, setUsers] = useState<Recipient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState<string | Room>("");
  const [shownRoomName, setShownRoomName] = useState<string>("No room joined");
  const [editMessage, setEditMessage] = useState<IMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState<IMessage | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [isCretaeStoryModalOpen, setIsCreateStoryModalOpen] =
    useState<boolean>(false);
  const [currentStory, setCurrentStory] = useState<IStory[] | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const [stories, setStories] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_BASE_URL}/dashboard/whoami`, {
        withCredentials: true,
      })
      .then((res) => {
        setSender(res?.data.responseObject);
        if (!res?.data.responseObject.username) navigate("/settings");
        localStorage.setItem("userId", res?.data?.responseObject._id ?? "");
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          navigate("/register");
        }
      });
  }, [navigate]);

  useEffect(() => {
    if (!sender) return;

    const socketInstance = io(`${import.meta.env.VITE_SOCKET_BASE_URL}`, {
      query: { userId: sender._id },
      transports: ["websocket"],
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
    setShownRoomName(typeof roomName === "string" ? roomName : roomName.name);
    setRoom(roomName);
    setPublicName(typeof roomName === "string" ? roomName : roomName.name);

    if (socket) {
      socket.emit(
        "rooms:joinRoom",
        typeof roomName === "string" ? roomName : roomName._id
      );
    }
  };

  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(
    null
  );
  const [open, setOpen] = useState(false);

  const profileHandler = (recipient: Recipient | null, room: Room | string) => {
    if (recipient?.username) {
      socket?.emit("users:getUserData", { recipientId: recipient._id });
      socket?.on("users:getUserDataResponse", (data: Recipient) => {
        setSelectedRecipient(data);
        setOpen(true);
      });
    } else if (typeof room === "object") {
      socket?.emit("rooms:getRoomData", room._id);
      socket?.on("rooms:getRoomDataResponse", (data: Room) => {
        setSelectedRoom(data);
        setOpenRoomModal(true);
      });
    }
  };

  const pvHandler = (user: Recipient | null) => {
    if (!user) return;

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

    socket?.emit("rooms:joinRoom", roomName);
  };

  const settingHandler = () => {
    navigate("/settings");
  };

  useEffect(() => {
    const draft = localStorage.getItem("draftMessage");
    draft ? setMessage(draft) : setMessage("");
  }, [room]);

  // useEffect(() => {
  //   if (room) {
  //     const formattedRoom = recipient?._id
  //       ? `${sender?._id}-${recipient?._id}`
  //       : typeof room === "object"
  //       ? room._id
  //       : "";

  //     socket?.emit("messages:getHistory", { roomName: formattedRoom });
  //     setMessages([]);

  //     socket?.on("messages:sendHistory", (messageData: Message[]) => {
  //       setMessages((prevMessages) => [...messageData, ...prevMessages]);
  //     });

  //     socket?.on(
  //       "messages:deleteMessageResponse",
  //       ({
  //         success,
  //         messageId,
  //         error,
  //         deletedBy,
  //         deletedByEveryone,
  //       }: DeleteMessageResponse) => {
  //         if (success) {
  //           setMessages((prevMessages) =>
  //             prevMessages.filter((msg) => {
  //               const isCurrentMessage = msg._id === messageId;
  //               const isDeletedForEveryone = deletedByEveryone;
  //               const isDeletedForSender =
  //                 deletedBy && deletedBy.includes(sender?._id ?? "");

  //               if (isDeletedForEveryone && isCurrentMessage) {
  //                 return false;
  //               }

  //               return !isCurrentMessage || !isDeletedForSender;
  //             })
  //           );
  //         } else {
  //           console.error("Failed to delete message:", error);
  //         }
  //       }
  //     );

  //     let observer: IntersectionObserver | null = null;
  //     const currentChatEnd = chatEndRef.current;

  //     if (currentChatEnd) {
  //       observer = new IntersectionObserver(
  //         (entries) => {
  //           const isAtBottom = entries[0].isIntersecting;

  //           if (isAtBottom && messages.length > 0) {
  //             // Emit the 'seen' event for all messages that are not 'seen'
  //             const unseenMessages = messages.filter(
  //               (message) => message.status !== "seen"
  //             );

  //             if (unseenMessages.length > 0) {
  //               socket?.emit("messages:seenMessage", {
  //                 messages: unseenMessages.map((msg) => msg._id),
  //                 room,
  //                 userId: sender?._id, // Current user marking messages as seen
  //               });
  //             }
  //           }
  //         },
  //         { threshold: 1.0 } // Adjust threshold based on when the element is considered in view
  //       );

  //       observer.observe(currentChatEnd);
  //     }

  //     socket?.on("messages:sendMessage", handleIncomingMessage);

  //     return () => {
  //       socket?.off("messages:deleteMessageResponse");
  //       socket?.off("messages:sendHistory");
  //       socket?.off("rooms:newRoomResponse");
  //       socket?.off("messages:message");
  //       socket?.off("messages:sendMessage", handleIncomingMessage);

  //       if (observer && currentChatEnd) {
  //         observer.unobserve(currentChatEnd);
  //       }
  //     };
  //   }
  // }, [room, socket]);

  // const handleIncomingMessage = (messageData: Message) => {
  //   setMessages((prevMessages) => {
  //     const currentRoomId = typeof room === "string" ? room : room?._id;
  //     const messageRoomId = messageData.room;

  //     if (messageRoomId !== currentRoomId) {
  //       return prevMessages;
  //     }

  //     const updatedMessages = prevMessages.map((msg) =>
  //       msg.tempId === messageData.tempId ? messageData : msg
  //     );

  //     if (!updatedMessages.some((msg) => msg._id === messageData._id)) {
  //       updatedMessages.push(messageData);
  //     }

  //     if (recipient && sender?._id !== messageData?.receiver?._id) {
  //       checkPageStatus(messageData.content, messageData.sender ?? "");
  //     }
  //     return updatedMessages;
  //   });
  // };

  useEffect(() => {
    if (!room) return;

    const formattedRoom = recipient?._id
      ? `${sender?._id}-${recipient?._id}`
      : typeof room === "object"
      ? room._id
      : "";

    socket?.emit("messages:getHistory", { roomName: formattedRoom });
    setMessages([]);

    socket?.on("messages:sendHistory", (messageData: IMessage[]) => {
      setMessages((prevMessages) => [...messageData, ...prevMessages]);
    });

    socket?.on(
      "messages:deleteMessageResponse",
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

    const handleIncomingMessage = (messageData: IMessage) => {
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

        if (recipient && sender?._id !== messageData?.receiver?._id) {
          checkPageStatus(messageData.content, messageData.sender ?? "");
        }

        return updatedMessages;
      });
    };

    socket?.on("messages:sendMessage", handleIncomingMessage);

    let observer: IntersectionObserver | null = null;
    const currentChatEnd = chatEndRef.current;

    if (currentChatEnd) {
      observer = new IntersectionObserver(
        (entries) => {
          const isAtBottom = entries[0].isIntersecting;

          if (isAtBottom && messages.length > 0) {
            const unseenMessages = messages.filter(
              (message) => message.status !== "seen"
            );

            if (unseenMessages.length > 0) {
              socket?.emit("messages:seenMessage", {
                messages: unseenMessages.map((msg) => msg._id),
                room,
                userId: sender?._id,
              });
            }
          }
        },
        { threshold: 1.0 }
      );

      observer.observe(currentChatEnd);
    }

    return () => {
      socket?.off("messages:deleteMessageResponse");
      socket?.off("messages:sendHistory");
      socket?.off("rooms:newRoomResponse");
      socket?.off("messages:message");
      socket?.off("messages:sendMessage", handleIncomingMessage); // This works fine

      if (observer && currentChatEnd) {
        observer.unobserve(currentChatEnd);
      }
    };
  }, [room, socket, sender, recipient]);

  socket?.on("messages:newRoomResponse", (roomData: Room[]) => {
    const userRooms = roomData.filter((room) =>
      room.participants.some(
        (participant) => participant.user.toString() === sender?._id
      )
    );

    if (userRooms.length > 0) {
      setRooms(() => [...userRooms]);
    }
  });

  socket?.on("stories:getStoriesResponse", (usersWithStories: IStory[]) => {
    setStories(usersWithStories);
  });

  socket?.on(
    "stories:deleteStoryResponse",
    ({ message, storyId }: { message: string; storyId: string }) => {
      setStories((prevStories) =>
        prevStories.filter((story) => story.id !== storyId)
      );

      Swal.fire({
        title: "Deleted!",
        text: message,
        icon: "success",
        confirmButtonText: "OK",
      });
    }
  );

  // socket?.on(
  //   "stories:editStoryResponse",
  //   ({ message }: { story: IStory; message: string }) => {
  //     Swal.fire({
  //       title: "Updated!",
  //       text: message,
  //       icon: "success",
  //       confirmButtonText: "OK",
  //     });
  //   }
  // );

  const [seenStoryUser, setSeenStoryUser] = useState([]);
  const [likesStoryUser, setLikesStoryUser] = useState([]);
  socket?.on(
    "stories:usersSeenStoryResponse",
    ({ seenBy, likes }: { seenBy: any; likes: any }) => {
      setSeenStoryUser(seenBy);
      setLikesStoryUser(likes);
    }
  );

  useEffect(() => {
    const handleVoiceMessageResponse = (messageData: VoiceMessageResponse) => {
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(
          (msg) => msg._id === messageData._id
        );
        if (!messageExists) {
          return [...prevMessages, messageData as IMessage];
        }
        return prevMessages;
      });
    };

    socket?.emit("stories:getStories", { userId: sender?._id });

    socket?.on("uploads:fileUploadRespond", (messageData: IMessage) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    socket?.on("stories:editMessageResponse", (messageData: IMessage) => {
      setEditMessage(null);

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageData._id ? messageData : msg
        )
      );
    });

    socket?.on("messages:forwardMessageResponse", (messageData: IMessage) => {
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

    socket?.on("uploads:voiceMessageResponse", handleVoiceMessageResponse);

    socket?.on("editRoomResponse", (updatedRoom: Room) => {
      setRooms((prevRooms) =>
        prevRooms.map((proom) =>
          proom._id === updatedRoom._id ? updatedRoom : proom
        )
      );
    });

    socket?.on("messages:seenMessage", (data: MessageSeenData) => {
      const { messages } = data;

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          messages.includes(msg._id ?? "") ? { ...msg, status: "seen" } : msg
        )
      );
    });

    return () => {
      socket?.off("messages:seenMessage");
      socket?.off("uploads:voiceMessageResponse", handleVoiceMessageResponse);
      socket?.off("uploads:fileUploadRespond");
      socket?.off("messages:forwardMessageResponse");
      socket?.off("messages:editMessageResponse");
      socket?.off("messages:editRoomResponse");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("error", (error: { message: string }) => {
      ErrorHandler(error.message);
    });

    socket.on("users:allUsers", (users: Recipient[]) => {
      setUsers(users);
    });

    return () => {
      socket.off("error");
      socket.off("users:allUsers");
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.emit("users:login", sender?._id);

      socket.on("users:userRooms", (rooms: Room[]) => {
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

      socket.on("rooms:removeUserResponse", handleRemoveUserResponse);

      return () => {
        socket.off("users:userRooms");
        socket.off("rooms:removeUserResponse", handleRemoveUserResponse);
      };
    }
  }, [socket, sender?._id]);

  const addRoomHandler = () => {
    const name = prompt("What is the name of the room?");
    if (name?.trim()) {
      if (name.length > 15) {
        alert("Use less then 15 charecters");
        return;
      }
      socket?.emit("rooms:newRoom", {
        name,
        senderId: sender?._id,
        type: "group",
        userId: sender?._id,
      });
    } else {
      alert("please write something down...");
    }
  };

  const storyHandler = () => {
    setIsCreateStoryModalOpen((prev) => !prev);
  };

  const createStoryHandler = () => {
    setIsCreateStoryModalOpen((prev) => !prev);
  };

  const storyOpenHandler = (story: IStory[]) => {
    setCurrentStoryIndex(0);
    setCurrentStory(story);
    setIsStoryModalOpen((prev) => !prev);
  };

  const addStoryHandler = async ({
    newDescription,
    newFilePath,
    newThumbnailPath,
    hyperLink,
  }: {
    newDescription: string;
    newFilePath: string;
    newThumbnailPath: string;
    hyperLink: string;
  }) => {
    socket?.emit("stories:addStory", {
      newDescription,
      newFilePath,
      newThumbnailPath,
      hyperLink,
    });
  };

  const deleteHandler = (storyId: string) => {
    setIsStoryModalOpen(false);
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this story!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      reverseButtons: true,
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        socket?.emit("stories:deleteStory", { storyId });
      }
    });
  };

  const seenUsersHandler = (storyId: string) => {
    socket?.emit("stories:usersSeenStory", { userId: sender?._id, storyId });
  };

  const linkHandler = (storyId: string) => {
    socket?.emit("stories:toggleLikeStory", { userId: sender?._id, storyId });
  };

  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
  const userListHandler = () => {
    setIsUserListModalOpen((prev) => !prev);
  };

  return (
    <div className="chat-container">
      <div className="sidebar" style={{ fontFamily: "Poppins" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>AmirChat</h2>
          <div
            onClick={settingHandler}
            style={{
              cursor: "pointer",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            <Avatar
              src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                sender?.profile
              }`}
              sx={
                sender?.stories && sender?.stories?.length > 0
                  ? { border: "1.5px solid purple" }
                  : { border: "1px solid lightgreen" }
              }
            />
            {/* <IoMdSettings size={30} /> */}
            <span className="plus-icon" onClick={storyHandler}>
              {/* <FaPlusCircle size={19} /> */}
            </span>
          </div>
        </div>

        {/* {rooms?.map((room: Room) => {
          return (
            <button
              key={room._id}
              onClick={() => joinRoom(room)}
              className="room-btn"
            >
              {room.name}
              <br />
              {room?.lastMessage?.content}
            </button>
          );
        })} */}

        {/* <button onClick={addRoomHandler} className="add-room-btn">
          <FaPlus />
          Add a Room
        </button> */}

        <div className="stories">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h2 style={{ marginBottom: 0 }}>Stories:</h2>
            <FaPlusCircle onClick={storyHandler} size={25} cursor={"pointer"} />
          </div>
          <Swiper spaceBetween={50} slidesPerView={2.8} dir="rtl">
            {stories.map((user, index) => (
              <SwiperSlide key={index}>
                <div
                  className="story-item"
                  onClick={() =>
                    user?.stories?.length && storyOpenHandler(user)
                  }
                >
                  <img
                    src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                      user?.profile
                    }`}
                    alt={user?.username}
                    height={130}
                    width={100}
                    style={{ objectFit: "cover", filter: "brightness(35%)" }}
                  />
                  <div
                    style={{
                      width: "100px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "absolute",
                      top: "23%",
                      color: "white",
                      gap: 5,
                    }}
                  >
                    <div className="avatar-wrapper">
                      <Avatar
                        src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                          user.profile
                        }`}
                        alt={user.username}
                        className="avatar"
                      />
                    </div>
                    <h6>
                      {sender?._id && sender?._id !== String(user?._id)
                        ? user?.username
                        : "You"}
                    </h6>

                    <span>{user?.stories?.length} Stories</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <Divider />
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ marginBottom: 0 }}>Chats</h2>
          <FaPlusCircle
            onClick={userListHandler}
            size={25}
            cursor={"pointer"}
          />
        </div>
        <div style={{ margin: "15px 0" }}>
          <button onClick={addRoomHandler} className="add-room-btn">
            <FaPlus />
            Add a Group or Channel
          </button>
          {rooms?.map((room: Room) => {
            return (
              <div
                key={room._id}
                onClick={() => joinRoom(room)}
                className="room-btn"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Avatar
                    // src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                    //   room?.lastMessage?.sender?.profile
                    // }`}
                    src={`unknown`}
                    alt={room.name}
                    sx={{ height: 40, width: 40 }}
                  />
                  {room.name}
                </div>
                <div
                  style={{
                    color: "gray",
                    marginLeft: "2px",
                    marginTop: "5px",
                  }}
                >
                  {room?.lastMessage ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <Avatar
                        src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                          room?.lastMessage?.sender?.profile
                        }`}
                        sx={{ height: 20, width: 20 }}
                      />
                      {room?.lastMessage?.sender?.username}:
                      {room?.lastMessage?.content}
                    </span>
                  ) : (
                    <span>No Messages</span>
                  )}
                </div>
              </div>
            );
          })}
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
        publicName={publicName}
        setRooms={setRooms}
        // @ts-ignore
        setRoom={setRoom}
        pinMessage={pinMessage}
        setPinMessage={setPinMessage}
        editMessage={editMessage}
        setEditMessage={setEditMessage}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
        rooms={rooms}
        chatEndRef={chatEndRef}
        selectedRecipient={selectedRecipient}
        setSelectedRecipient={setSelectedRecipient}
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
        openRoomModal={openRoomModal}
        setOpenRoomModal={setOpenRoomModal}
        allUsers={users}
        open={open}
        setOpen={setOpen}
        pvHandler={pvHandler}
        profileHandler={profileHandler}
      />

      <CreateStoryModal
        open={isCretaeStoryModalOpen}
        onClose={storyHandler}
        // @ts-ignore
        currentStory={currentStory}
        setCurrentStory={setCurrentStory}
        addStoryHandler={addStoryHandler}
        senderProfile={sender?.profile}
      />

      <StoryModal
        onClose={() => setIsStoryModalOpen(false)}
        open={isStoryModalOpen}
        // @ts-ignore
        user={currentStory ?? null}
        senderId={sender?._id}
        deleteHandler={deleteHandler}
        currentStoryIndex={currentStoryIndex}
        setCurrentStoryIndex={setCurrentStoryIndex}
        scoket={socket}
        seenUsersHandler={seenUsersHandler}
        seenStoryUser={seenStoryUser}
        likesStoryUser={likesStoryUser}
        linkHandler={linkHandler}
        users={users}
      />

      <UsersModal
        open={isUserListModalOpen}
        handleClose={userListHandler}
        profileHandler={profileHandler}
        users={users}
        sender={sender}
        selectedRecipient={selectedRecipient}
        setSelectedRecipient={setSelectedRecipient}
        setRooms={setRooms}
        socket={socket as typeof Socket}
      />
    </div>
  );
};

export default Home;
