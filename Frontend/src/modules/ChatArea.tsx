import { CiClock2 } from "react-icons/ci";
import { FaChevronDown, FaReply, FaUserPlus } from "react-icons/fa";
import { Avatar, Button, Dialog } from "@mui/material";
import { RxCross2 } from "react-icons/rx";
import { IUser, Message, Recipient, Room, Sender } from "./types/types";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import axios from "axios";
import { ProfileModal } from "./ProfileModal";
import { TbLogout2 } from "react-icons/tb";
import ChatInput from "./ChatInput";
import Swal, { SweetAlertOptions } from "sweetalert2";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { GrFormPin } from "react-icons/gr";
import { IoIosChatbubbles, IoMdSearch } from "react-icons/io";
import ForwardModal from "./ForwardModal";
import JoinRoomModal from "./JoinRoomModal";
import { RiShareForwardFill } from "react-icons/ri";
import EditRoomModal from "./EditRoomModal";
import MessageStatus from "./MessageStatus";
import RoomModal from "./RoomModal";
import SearchModal from "./SearchModal";
import { BsFillChatSquareDotsFill } from "react-icons/bs";
import SupportChatModal from "./SupportChatModal";

interface ChatAreaProps {
  offlineUsers: Recipient[];
  onlineUsers: Recipient[];
  socket: typeof Socket | null;
  sender: Sender | null;
  recipient: Recipient | null;
  room: Room | string;
  messages: Message[];
  shownRoomName: string;
  message: string;
  setMessage: (message: string) => void;
  setMessages: (messages: Message[]) => void;
  publicName: string;
  setOfflineUsers: (users: Recipient[]) => void;
  setOnlineUsers: (users: Recipient[]) => void;
  setRooms: (rooms: Room[]) => void;
  setRoom: (room: Room | string | null) => void;
  setShownRoomName: (name: string) => void;
  pinMessage: Message | null;
  setPinMessage: (message: Message | null) => void;
  setEditMessage: (message: Message | null) => void;
  editMessage: Message | null;
  replyMessage: Message | null;
  setReplyMessage: (message: Message | null) => void;
  rooms: Room[];
  chatEndRef: React.RefObject<HTMLDivElement>;
}

function ChatArea({
  offlineUsers,
  onlineUsers,
  socket,
  sender,
  recipient,
  room,
  shownRoomName,
  messages,
  message,
  setMessage,
  setMessages,
  publicName,
  setRooms,
  setRoom,
  setShownRoomName,
  setPinMessage,
  setEditMessage,
  editMessage,
  replyMessage,
  setReplyMessage,
  rooms,
  chatEndRef,
}: ChatAreaProps) {
  const extractMetadata = (messages: Message[]) => {
    messages.forEach((message) => {
      if (message.content) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = message.content.match(urlRegex);

        if (urls) {
          urls.forEach((url) => {
            socket?.emit("additional:metadataReader", {
              url,
              messageId: message._id,
            });
          });
        }
      }
    });
  };
  const [openModal, setOpenModal] = useState(false);

  const handleCloseModal = () => setOpenModal(false);

  const [nonParticipantOnlineUsers, setNonParticipantOnlineUsers] = useState<
    Recipient[]
  >([]);
  const [nonParticipantOfflineUsers, setNonParticipantOfflineUsers] = useState<
    Recipient[]
  >([]);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );

  const [selectedMessageToForward, setSelectedMessageToForward] =
    useState<Message | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const pinnedMessageRef = useRef<HTMLDivElement | null>(null);
  const pinnedMessageDisplayRef = useRef<HTMLDivElement | null>(null);
  const [currentPinnedMessage, setCurrentPinnedMessage] =
    useState<Message | null>(null);

  const [openForwardModal, setOpenForwardModal] = useState(false);

  // const lastMessageRef = useRef<HTMLDivElement | null>(null);
  // const observer = useRef<IntersectionObserver | null>(null);

  // const [messageMetadata, setMessageMetadata] = useState<{
  //   [key: string]: {
  //     messageId?: string;
  //     title: string;
  //     description: string;
  //     image: string;
  //     url: string;
  //   };
  // }>({});

  const [uploadFileProgress, setUploadFileProgress] = useState<number | string>(
    0
  );

  useEffect(() => {
    socket?.on(
      "additional:metadataReaderResponse",
      (data: {
        metadata: {
          messageId?: string;
          title: string;
          description: string;
          image: string;
          url: string;
        };
      }) => {
        const { metadata } = data;

        if (metadata?.messageId) {
          // setMessageMetadata((prev) => ({
          //   ...prev,
          //   [metadata.messageId as string]: metadata,
          // }));
        }
      }
    );

    return () => {
      socket?.off("additional:metadataReaderResponse");
    };
  }, [socket]);

  useEffect(() => {
    if (messages) {
      extractMetadata(messages);
    }
  }, [messages]);

  // useEffect(() => {
  //   if (lastMessageRef.current) {
  //     observer.current = new IntersectionObserver((entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           const messageId = entry.target.getAttribute("data-message-id");
  //           if (messageId) {
  //             updateMessageStatus(messageId, "seen");
  //           }
  //         }
  //       });
  //     });

  //     if (lastMessageRef.current) {
  //       observer.current.observe(lastMessageRef.current);
  //     }
  //   }

  //   return () => {
  //     if (observer.current && lastMessageRef.current) {
  //       observer.current.unobserve(lastMessageRef.current);
  //     }
  //   };
  // }, [messages]);

  // const updateMessageStatus = (messageId: string, status: string) => {
  //   socket?.emit("updateMessageStatus", { messageId, status });
  // };

  useEffect(() => {
    socket?.on(
      "messages:pinMessageResponse",
      ({ room: responseRoom, message }: any) => {
        if (room === responseRoom) {
          setPinMessage(message);
          // @ts-ignore

          setMessages((prevMessages: Message[]) =>
            prevMessages.map((msg: Message) =>
              msg._id === message._id
                ? { ...msg, isPinned: true }
                : { ...msg, isPinned: false }
            )
          );
        }
      }
    );

    socket?.on(
      "messages:unpinMessageResponse",
      ({ room: responseRoom, message }: any) => {
        if (room === responseRoom) {
          setPinMessage(null);
          // @ts-ignore
          setMessages((prevMessages: Message[]) =>
            prevMessages.map((msg: Message) =>
              msg._id === message._id ? { ...msg, isPinned: false } : msg
            )
          );
        }
      }
    );

    return () => {
      socket?.off("messages:pinMessageResponse");
      socket?.off("messages:unpinMessageResponse");
    };
  }, [room, socket]);

  const addUserToRoom = (data: { userId: string; room: string }) => {
    const { userId } = data;

    socket?.emit("rooms:joinRoom", data);

    setNonParticipantOnlineUsers((prevUsers) =>
      prevUsers.filter((user) => user._id !== userId)
    );
    setNonParticipantOfflineUsers((prevUsers) =>
      prevUsers.filter((user) => user._id !== userId)
    );
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    recordedChunksRef.current = [];

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
      })
      .catch((err) => console.error("Error accessing microphone:", err));
  };

  const handleStopRecording = () => {
    setIsRecording(false);

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });

        if (blob.size === 0) {
          console.error("Blob is empty. Check recordedChunks.");
          return;
        }

        // Convert blob to FormData to send it as a file
        const formData = new FormData();
        formData.append("voiceMessage", blob, "voice-message.webm");

        // const senderJson = JSON.stringify(sender?._id);
        // const recipientJson = JSON.stringify(recipient && recipient?._id);
        // const roomJson = JSON.stringify(room);

        // formData.append("sender", senderJson);
        // if (recipient) formData.append("recipient", recipientJson);
        // formData.append("room", roomJson);

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_BASE_URL}/upload/voice`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              withCredentials: true,
            }
          );

          const voiceId = await response.data.responseObject._id;

          socket?.emit("uploads:voiceMessage", {
            voiceId,
            room,
          });
        } catch (error) {
          console.error("Error uploading voice message:", error);
        }
      };
    }
  };

  const handleDeleteMessage = async (msg: Message, isAdminOrOwner: boolean) => {
    const canDeleteForEveryone =
      isAdminOrOwner || msg?.sender?._id === sender?._id;

    const deleteMessageOptions: SweetAlertOptions = {
      title: "Delete Message",
      text: "Do you want to delete this message?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      showDenyButton: true,
      denyButtonText: "Delete for Me",
    };

    if (canDeleteForEveryone) {
      deleteMessageOptions.confirmButtonText = "Delete for Everyone";
    }

    Swal.fire(deleteMessageOptions).then((result) => {
      if (result.isConfirmed && canDeleteForEveryone) {
        // Emit event to delete for everyone
        socket?.emit("messages:deleteMessage", {
          messageId: msg._id,
          userId: sender?._id,
          deleteForEveryone: true,
        });
      } else if (result.isDenied) {
        // Emit event to delete for me only
        socket?.emit("messages:deleteMessage", {
          messageId: msg._id,
          userId: sender?._id,
          deleteForEveryone: false,
        });
      }
    });
  };

  const handlePinMessage = async (message: Message) => {
    if (message.isPinned) {
      Swal.fire({
        title: "Unpin Message",
        text: "Do you want to unpin this message?",
        icon: "question",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Unpin",
      }).then((result) => {
        if (result.isConfirmed) {
          socket?.emit("messages:unpinMessage", {
            room,
            messageId: message._id,
          });
        }
      });
    } else {
      Swal.fire({
        title: "Pin Message",
        text: "Do you want to pin this message?",
        icon: "question",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Pin",
      }).then((result) => {
        if (result.isConfirmed) {
          socket?.emit("messages:pinMessage", {
            room,
            messageId: message._id,
          });
        }
      });
    }
  };

  const handleForwardMessage = (message: Message) => {
    setSelectedMessageToForward(message);
    handleOpenForwardModal();
  };

  const handleSaveMessage = (message: Message) => {
    Swal.fire({
      title: "Save Message",
      text: "Do you want to save this message?",
      icon: "question",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Save",
    }).then((result) => {
      if (result.isConfirmed) {
        socket?.emit("messages:saveMessage", {
          recipientId: sender?._id,
          message,
        });
      }
    });
  };

  const handleEditMessage = (message: Message) => {
    if (sender?._id === message.sender._id) {
      setEditMessage(message);
      setMessage(message.content);
    } else {
      Swal.fire({
        title: "Edit Message",
        text: "You Can't Edit This Message",
        icon: "error",
        confirmButtonText: "Dismiss",
      });
    }
  };

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message).then(() => {
      Swal.fire({
        title: "Copy Message",
        text: "Message Is Successfully Copied !",
        icon: "success",
        confirmButtonText: "OK",
      });
    });
  };

  const toggleOptions = (messageId: string) => {
    setSelectedMessageId(selectedMessageId === messageId ? null : messageId);
  };

  const showModalHandler = (room: Room) => {
    const onlineUsersNotInRoom = onlineUsers.filter(
      (user: Recipient) =>
        !room.participants.some(
          (participant) => participant.user.toString() === user._id
        )
    );

    const offlineUsersNotInRoom = offlineUsers.filter(
      (user: Recipient) =>
        !room.participants.some(
          (participant) => participant.user.toString() === user._id
        )
    );

    setNonParticipantOnlineUsers(onlineUsersNotInRoom);
    setNonParticipantOfflineUsers(offlineUsersNotInRoom);

    setOpenModal(true);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      socket?.emit("chats:isTyping", {
        senderId: sender?._id,
        room,
        isTyping: false,
      });
    }, 1000);

    socket?.emit("chats:isTyping", {
      senderId: sender?._id,
      room,
      isTyping: true,
    });

    return () => clearTimeout(typingTimeout);
  }, [message]);

  const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    socket?.on(
      "chats:typing",
      ({ senderId, isTyping }: { senderId: string; isTyping: boolean }) => {
        setTypingUsers((prevTypingUsers) => ({
          ...prevTypingUsers,
          [senderId]: isTyping,
        }));
      }
    );

    return () => {
      socket?.off("chats:typing");
    };
  }, [socket]);

  const [open, setOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(
    null
  );

  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const profileHandler = (recipient: Recipient | null, room: Room | string) => {
    if (recipient?.username) {
      socket?.emit("users:getUserData", { recipientId: recipient._id });
      // set loading on
      socket?.on("users:getUserDataResponse", (data: Recipient) => {
        setSelectedRecipient(data);
        // set loading off
        setOpen(true); // Open the user modal
      });
    } else if (typeof room === "object") {
      socket?.emit("rooms:getRoomData", room._id);
      socket?.on("rooms:getRoomDataResponse", (data: Room) => {
        setSelectedRoom(data);
        setOpenRoomModal(true);
      });
    }
  };

  const [searchModal, setSearchModal] = useState(false);

  const searchModalHandler = () => {
    setFoundMessages([]);
    setSearchModal(true);
  };

  const searchHandler = ({
    word,
    room,
  }: {
    word: string;
    room: Room | string;
  }) => {
    if (typeof room === "object") {
      socket?.emit("messages:search", { word, room: room._id });
    } else {
      socket?.emit("messages:search", { word, room: room });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRecipient(null);
  };

  const leaveRoomHandler = (room: Room, sender: string) => {
    // @ts-ignore
    if (room && room.name) {
      if (confirm("Are You Sure You Want To Do This??")) {
        socket?.emit("rooms:leaveRoom", { room: room._id, sender });
        setRoom(null);
        setShownRoomName("No room joined");
      }
    }
  };

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [foundMessages, setFoundMessages] = useState<Message[]>([]);

  const handleEditRoom = (updatedRoom: {
    name: string;
    bio: string;
    isGroup: boolean;
  }) => {
    socket?.emit("rooms:editRoom", { room: room, ...updatedRoom });
  };

  const editRoomHandler = () => {
    setEditModalOpen(true);
  };

  socket?.on("rooms:leaveRoomResponse", (rooms: Room[]) => {
    setRooms(rooms);
  });

  socket?.on("rooms:userPromoted", (updatedRoom: Room) => {
    setSelectedRoom(updatedRoom);
  });

  socket?.on("rooms:removeUserResponse", (updatedRoom: Room) => {
    setSelectedRoom(updatedRoom);
  });

  socket?.on("messages:searchResults", (foundMessages: Message[]) => {
    setFoundMessages(foundMessages);
  });

  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const firstPinnedMessage = messages.find((msg: Message) => msg.isPinned);
    setCurrentPinnedMessage(firstPinnedMessage || null);
  }, [messages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && currentPinnedMessage) {
            pinnedMessageDisplayRef.current?.classList.add("show");
          } else {
            pinnedMessageDisplayRef.current?.classList.remove("show");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (pinnedMessageRef.current) {
      observer.observe(pinnedMessageRef.current);
    }

    return () => {
      if (pinnedMessageRef.current) {
        observer.unobserve(pinnedMessageRef.current);
      }
    };
  }, [currentPinnedMessage]);

  const scrollToPinnedMessage = () => {
    if (pinnedMessageRef.current) {
      pinnedMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleReplyMessage = (message: Message) => {
    setReplyMessage(message);
  };

  const handleOpenForwardModal = () => {
    setOpenForwardModal(true);
  };

  const handleCloseForwardModal = () => {
    setOpenForwardModal(false);
  };

  const forwardMessage = (
    room: Room,
    message: Message,
    receiverId?: string
  ) => {
    socket?.emit("messages:forwardMessage", {
      messageId: message._id,
      room: room._id,
      receiverId: receiverId ? receiverId : null,
    });
    handleCloseForwardModal();
    Swal.fire({
      title: "Message Forwarded",
      text: "Message Forwarded Successfully!",
      icon: "success",
      confirmButtonText: "Done",
    });
  };

  const handleRemoveUser = (userId: string, roomId: string) => {
    socket?.emit("rooms:removeUser", { senderId: sender?._id, userId, roomId });
  };

  const handlePromoteUser = (
    userId: string,
    roomId: string,
    newRole: string
  ) => {
    socket?.emit("rooms:promoteUser", {
      senderId: sender?._id,
      userId,
      roomId,
      newRole,
    });
  };

  let page = 0;
  const pageSize = 25;

  const handleLoadMore = () => {
    page += 1;

    const formattedRoom = recipient?._id
      ? `${sender?._id}-${recipient?._id}`
      : typeof room === "object"
      ? room._id
      : "";

    socket?.emit("messages:getHistory", {
      roomName: formattedRoom,
      page,
      pageSize,
    });
  };

  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const supportModalHandler = () => {
    setSupportModalOpen(true);
  };

  return (
    <div className="chat-area" style={{ fontFamily: "Poppins" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 30px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <h2
            onClick={() => profileHandler(recipient, room)}
            style={{ display: "flex", alignItems: "center" }}
          >
            {recipient?.profile ? (
              <Avatar
                src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                  recipient.profile
                }`}
                alt={recipient.username}
                className="avatar"
              />
            ) : (
              "Chat Room: "
            )}{" "}
            <span style={{ marginLeft: "15px" }}>
              {typeof shownRoomName === "string"
                ? shownRoomName
                : typeof shownRoomName === "object"
                ? // @ts-ignore
                  shownRoomName.name
                : "No room joined"}
            </span>
            {Object.keys(typingUsers).map((userId) => {
              if (typingUsers[userId] && userId !== sender?._id) {
                return (
                  <span
                    key={userId}
                    style={{
                      marginLeft: "5px",
                      fontWeight: "normal",
                      fontSize: "1rem",
                    }}
                  >
                    (typing...)
                  </span>
                );
              }
              return null;
            })}
          </h2>
          <div
            style={{
              background: "#cccccc",
              padding: 10,
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={() => searchModalHandler()}
          >
            {shownRoomName === "No room joined" ? "" : <IoMdSearch size={25} />}
          </div>
        </div>

        {typeof shownRoomName === "object" ? (
          <div
            style={{
              padding: "5px",
              cursor: "pointer",
              display: "flex",
              gap: "25px",
            }}
          >
            {typeof room === "object" &&
              room.participants?.some(
                (participant: any) =>
                  participant.user._id === sender?._id &&
                  (participant.role === "owner" || participant.role === "admin")
              ) && (
                <>
                  <div onClick={() => editRoomHandler()}>
                    <MdOutlineModeEditOutline size={27} />
                  </div>
                  <div onClick={() => showModalHandler(shownRoomName)}>
                    <FaUserPlus size={25} />
                  </div>
                </>
              )}

            {typeof room === "object" &&
              room.name !== "General" &&
              room.name !== "Announcements" && (
                <div
                  onClick={() =>
                    leaveRoomHandler(shownRoomName, sender?._id ?? "")
                  }
                >
                  <TbLogout2 size={27} />
                </div>
              )}
          </div>
        ) : (
          ""
        )}

        {selectedRecipient && (
          <ProfileModal
            // @ts-ignore
            recipient={selectedRecipient as Required<Recipient>} // Type casting
            open={open}
            handleClose={handleClose}
          />
        )}
      </div>

      {room ? (
        <div
          className="messages"
          style={{ overflowY: "scroll", height: "100%" }}
        >
          {currentPinnedMessage && (
            <div
              onClick={scrollToPinnedMessage}
              ref={pinnedMessageDisplayRef}
              style={{
                cursor: "pointer",
                position: "sticky",
                top: "0",
                zIndex: 1,
                backgroundColor: "#ffffff",
                padding: "3px 10px",
                marginBottom: "10px",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              }}
              className="pinned-message-display"
            >
              <div>
                <p style={{ margin: "0", fontWeight: "bold" }}>
                  Pinned Message from {currentPinnedMessage?.sender?.username}:
                </p>
                <p style={{ margin: "0", fontSize: "0.9rem" }}>
                  {currentPinnedMessage?.content}
                </p>
              </div>

              <button
                style={{
                  backgroundColor: "transparent",
                  width: "100px",
                  border: "none",
                  color: "#000",
                }}
              >
                <GrFormPin size={30} />
              </button>
            </div>
          )}

          <Button variant="outlined" onClick={handleLoadMore}>
            Load More
          </Button>
          {messages.map((msg: Message) => {
            // @ts-ignore
            const isAdminOrOwner = room.participants?.some(
              (participant: any) =>
                participant.user._id === sender?._id &&
                (participant.role === "owner" || participant.role === "admin")
            );
            return (
              <div
                key={msg._id || msg.tempId}
                className="message-container"
                ref={msg.isPinned ? pinnedMessageRef : null}
              >
                <div
                  className={`message ${
                    msg?.sender?._id === sender?._id ? "sent" : "received"
                  }`}
                  style={{ minWidth: "200px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        msg?.sender?._id === sender?._id ? "end" : "start",
                      flexDirection:
                        msg?.sender?._id === sender?._id
                          ? "row-reverse"
                          : "row",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                    }}
                    onClick={() => profileHandler(msg?.sender, room)}
                  >
                    <Avatar
                      src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                        msg.sender.profile
                      }`}
                      alt={msg.sender.username}
                      className="avatar"
                      sx={{
                        marginRight: "0",
                        display:
                          msg?.sender?._id === sender?._id ? "none" : "inherit",
                      }}
                    />
                    <p
                      style={{
                        textAlign:
                          msg?.sender?._id === sender?._id ? "right" : "left",
                        marginTop: "0px",
                      }}
                    >
                      {msg?.sender?.username === sender?.username
                        ? "You"
                        : msg.sender.username}
                    </p>
                  </div>
                  {msg.replyTo && (
                    <p
                      className="message-reply"
                      style={{
                        backgroundColor:
                          msg?.sender?._id === sender?._id
                            ? "#c5e8fa"
                            : "#f9ede4",
                      }}
                    >
                      <span
                        style={{
                          textAlign:
                            msg?.sender?._id === sender?._id ? "right" : "left",
                        }}
                      >
                        {msg?.replyTo?.sender?.username
                          ? msg?.replyTo?.sender?.username
                          : msg?.replyTo?.$__?.parent?.replyTo?.sender
                              ?.username}
                      </span>
                      <span
                        style={{
                          textAlign:
                            msg?.sender?._id === sender?._id ? "right" : "left",
                          // msg?.sender?._id === sender?._id ? "left" : "right",
                        }}
                      >
                        {msg.replyTo.file
                          ? "File"
                          : msg.replyTo.voice
                          ? "Voice Message"
                          : msg.replyTo.content}
                      </span>
                    </p>
                  )}
                  <p
                    style={{
                      textAlign:
                        msg?.sender?._id === sender?._id ? "right" : "left",
                      margin: "5px 0 0 0",
                      fontFamily: "IranYekan",
                      fontSize: "0.9rem",
                    }}
                    dir="rtl"
                  >
                    {msg?.content}
                  </p>
                  {msg.storyId && (
                    <div
                      className="message-metadata"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "10px",
                        margin: "10px 0",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        padding: "10px",
                      }}
                    >
                      <img
                        src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                          typeof msg.storyId === "object"
                            ? msg.storyId.thumbnail
                            : ""
                        }`}
                        alt="Story preview"
                        style={{
                          maxWidth: "100px",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          window.open(
                            typeof msg.storyId === "object"
                              ? msg.storyId.hyperLink
                              : "",
                            "_blank"
                          )
                        }
                      />
                      <div>
                        <p style={{ margin: "0", fontWeight: "bold" }}>
                          Story Preview
                        </p>
                        <p style={{ margin: "0", fontSize: "0.9rem" }}>
                          {typeof msg.storyId === "object"
                            ? msg.storyId.description?.substring(0, 50) + "..."
                            : ""}
                        </p>
                      </div>
                    </div>
                  )}
                  <p
                    className="timestamp"
                    style={{
                      textAlign:
                        msg?.sender?._id === sender?._id ? "left" : "right",
                      margin: "5px 0 0 0",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      {msg.isSending || !msg.createdAt ? (
                        <CiClock2 size={10} />
                      ) : msg.createdAt ? (
                        new Date(msg.createdAt).toLocaleTimeString()
                      ) : (
                        "Unknown Time"
                      )}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      {msg.isPinned && (
                        <span style={{ marginTop: "2px" }}>
                          <GrFormPin size={13} />
                        </span>
                      )}
                      {msg.isEdited && (
                        <span>
                          <MdOutlineModeEditOutline size={13} />
                        </span>
                      )}
                      {msg.isForwarded && (
                        <span>
                          <RiShareForwardFill size={13} />
                        </span>
                      )}
                      <span>
                        <MessageStatus status={msg.status} />
                      </span>
                    </span>
                  </p>
                  <div className="message-options">
                    <button
                      style={{
                        color: "red",
                        width: "20px",
                        position: "absolute",
                        top: "-5px",
                        right:
                          // msg?.sender?._id === sender?._id ? "100%" : "-35px",
                          msg?.sender?._id === sender?._id ? "85%" : "0",
                      }}
                      onClick={() => toggleOptions(msg._id ?? "")}
                    >
                      ⋮
                    </button>
                    {selectedMessageId === msg._id && (
                      <div
                        className="options-dropdown"
                        style={{
                          position: "absolute",
                          // top: "35px",
                          top: "15px",
                          right:
                            msg.sender._id === sender?._id ? "100%" : "-83px",
                        }}
                      >
                        <button
                          onClick={() => {
                            toggleOptions(msg._id ?? "");
                            handleReplyMessage(msg);
                            setEditMessage(null);
                            setMessage("");
                          }}
                        >
                          Reply{" "}
                        </button>

                        {!msg.file && !msg.voice && (
                          <button
                            onClick={() => {
                              toggleOptions(msg._id ?? "");
                              handleCopyMessage(msg.content);
                            }}
                          >
                            Copy
                          </button>
                        )}

                        {isAdminOrOwner ||
                          (typeof room === "string" && (
                            <button
                              onClick={() => {
                                toggleOptions(msg._id ?? "");
                                handlePinMessage(msg);
                              }}
                            >
                              {msg.isPinned ? "Unpin" : "Pin"}
                            </button>
                          ))}

                        <button
                          onClick={() => {
                            toggleOptions(msg._id ?? "");
                            handleSaveMessage(msg);
                          }}
                        >
                          Save
                        </button>

                        <button
                          onClick={() => {
                            toggleOptions(msg._id ?? "");
                            handleForwardMessage(msg);
                          }}
                        >
                          Forward
                        </button>

                        {!msg.file &&
                          !msg.voice &&
                          !msg.isForwarded &&
                          sender?._id === msg.sender._id && (
                            <button
                              onClick={() => {
                                toggleOptions(msg._id ?? "");
                                handleEditMessage(msg);
                                setReplyMessage(null);
                              }}
                            >
                              Edit
                            </button>
                          )}
                        <button
                          onClick={() => {
                            toggleOptions(msg._id ?? "");
                            handleDeleteMessage(msg, isAdminOrOwner);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {msg.voice && (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent:
                        msg?.sender?._id === sender?._id ? "right" : "left",
                    }}
                  >
                    <audio className="audio-player" controls>
                      <source
                        src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                          typeof msg.voice === "object"
                            ? msg.voice.filePath
                            : ""
                        }`}
                        type="audio/mp3"
                      />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                {msg.file && (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent:
                        msg?.sender?._id === sender?._id ? "right" : "left",
                    }}
                  >
                    {/\.(jpg|jpeg|png|gif)$/i.test(
                      typeof msg.file === "object" ? msg.file.filePath : ""
                    ) ? (
                      <div>
                        <img
                          src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                            typeof msg.file === "object"
                              ? msg.file.filePath
                              : ""
                          }`}
                          alt="Uploaded media"
                          style={{
                            maxWidth: "400px",
                            borderRadius: "8px",
                            cursor: "pointer",
                          }}
                          onClick={toggleFullScreen} // Trigger full screen on click
                        />

                        <Dialog
                          open={isFullScreen}
                          onClose={toggleFullScreen}
                          fullScreen
                        >
                          <img
                            src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                              typeof msg.file === "object"
                                ? msg.file.filePath
                                : ""
                            }`}
                            alt="Uploaded media in full screen"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              backgroundColor: "black",
                            }}
                            onClick={toggleFullScreen}
                          />
                        </Dialog>
                      </div>
                    ) : /\.(mp4|mov|avi|wmv)$/i.test(
                        typeof msg.file === "object" ? msg.file.filePath : ""
                      ) ? (
                      <video
                        src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                          typeof msg.file === "object" ? msg.file.filePath : ""
                        }`}
                        controls
                        style={{ maxWidth: "400px", borderRadius: "8px" }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : /\.(zip|rar)$/i.test(
                        typeof msg.file === "object" ? msg.file.filePath : ""
                      ) ? (
                      <div
                        style={{
                          padding: "20px",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <p style={{ margin: 0 }}>
                          <strong>Compressed File:</strong>{" "}
                          {typeof msg.file === "object"
                            ? msg.file.filePath.split("/").pop()?.split("*")[0]
                            : ""}
                        </p>
                        <a
                          href={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                            typeof msg.file === "object"
                              ? msg.file.filePath
                              : ""
                          }`}
                          download
                          style={{
                            display: "inline-block",
                            marginTop: "10px",
                            padding: "5px 10px",
                            backgroundColor: "#007bff",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                          }}
                        >
                          Download
                        </a>
                      </div>
                    ) : /\.(404)$/i.test(
                        typeof msg.file === "string" ? msg.file : ""
                      ) ? (
                      <p>File not found</p>
                    ) : (
                      <p>Unsupported file format</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {room && (
            <div className="down-icon" onClick={scrollToBottom}>
              <FaChevronDown style={styles.icon} />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <span>
              <IoIosChatbubbles size={70} color="#999" />
            </span>
            <h3 style={{ color: "#999" }}>
              Please Join A Room To Start Chatting !
            </h3>
          </div>

          {/* support icon */}
          <div
            style={{
              background: "#2c86c2",
              borderRadius: "50%",
              width: 60,
              height: 60,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              position: "absolute",
              right: "25px",
              bottom: "95px",
            }}
            onClick={supportModalHandler}
          >
            <BsFillChatSquareDotsFill size={25} color="#FFF" />
          </div>
        </div>
      )}

      {editMessage ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "5px 0",
            columnGap: "10px",
            marginLeft: "5px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>
              <MdOutlineModeEditOutline style={styles.icon} />
            </span>
            <span>
              Editing <span style={{ fontWeight: "bold" }}>You</span> :{" "}
              {editMessage.content}
            </span>
          </div>
          <div
            onClick={() => {
              setEditMessage(null);
              setMessage("");
            }}
            style={{ cursor: "pointer", padding: "3px" }}
          >
            <RxCross2 style={styles.icon} />
          </div>
        </div>
      ) : (
        ""
      )}

      {replyMessage ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "5px 0",
            columnGap: "10px",
            marginLeft: "5px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>
              <FaReply style={styles.icon} />
            </span>
            <span>
              Replying To {replyMessage.sender.username}: {replyMessage.content}
            </span>
          </div>
          <div
            onClick={() => {
              setReplyMessage(null);
              setMessage("");
            }}
            style={{ cursor: "pointer", padding: "3px" }}
          >
            <RxCross2 style={styles.icon} />
          </div>
        </div>
      ) : (
        ""
      )}

      <div
        style={{
          position: "relative",
          height: "40px",
          margin: "10px 0",
          display: uploadFileProgress !== 0 ? "flex" : "none",
        }}
      >
        {uploadFileProgress !== 0 && (
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#eee",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${uploadFileProgress}%`,
                height: "100%",
                backgroundColor: "#2196f3",
                transition: "width 0.3s ease",
                borderRadius: "4px",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "#666",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {uploadFileProgress}%
              </span>
            </div>
          </div>
        )}
      </div>

      <ChatInput
        room={room}
        socket={socket}
        sender={sender}
        message={message}
        recipient={recipient}
        setMessage={setMessage}
        publicName={publicName}
        isRecording={isRecording}
        editMessage={editMessage}
        setMessages={setMessages}
        replyMessage={replyMessage}
        setEditMessage={setEditMessage}
        setReplyMessage={setReplyMessage}
        handleStopRecording={handleStopRecording}
        handleStartRecording={handleStartRecording}
        setUploadFileProgress={setUploadFileProgress}
      />

      <ForwardModal
        offlineUsers={offlineUsers}
        onlineUsers={onlineUsers}
        ModalStyle={ModalStyle}
        openForwardModal={openForwardModal}
        forwardMessage={forwardMessage}
        handleCloseForwardModal={handleCloseForwardModal}
        sender={sender}
        selectedMessageToForward={selectedMessageToForward}
        userRooms={rooms}
      />

      <JoinRoomModal
        nonParticipantOnlineUsers={nonParticipantOnlineUsers}
        openModal={openModal}
        handleCloseModal={handleCloseModal}
        nonParticipantOfflineUsers={nonParticipantOfflineUsers}
        addUserToRoom={addUserToRoom}
        room={room}
        ModalStyle={ModalStyle}
      />

      <EditRoomModal
        open={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        // @ts-ignore
        room={room}
        onSave={handleEditRoom}
      />

      <RoomModal
        open={openRoomModal}
        handleClose={() => setOpenRoomModal(false)}
        room={selectedRoom}
        handleRemoveUser={handleRemoveUser}
        handlePromoteUser={handlePromoteUser}
        senderId={sender?._id ?? ""}
        profileHandler={profileHandler}
      />

      <SearchModal
        open={searchModal}
        onClose={() => setSearchModal(false)}
        onSearch={searchHandler}
        room={room}
        foundMessages={foundMessages}
        sender={sender}
      />

      <SupportChatModal
        open={supportModalOpen}
        setOpen={setSupportModalOpen}
        messages={messages}
        sender={sender}
        onlineUsers={onlineUsers}
        room={room}
        socket={socket}
        publicName={publicName}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
      />
    </div>
  );
}

const styles = {
  noRoomMessage: {
    display: "flex" as const,
    flexDirection: "column" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    height: "100%",
    textAlign: "center" as const,
    color: "#888",
  },
  form: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "10px",
    backgroundColor: "#f0f0f0",
    borderRadius: "10px",
  },
  inputField: {
    flex: 8,
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    marginRight: "10px",
    fontSize: "16px",
  },
  voiceMessageControls: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    marginRight: "10px",
  },
  sendBtn: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "10px",
    cursor: "pointer",
  },
  icon: {
    fontSize: "24px",
    color: "#333",
  },
};

const ModalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default ChatArea;
