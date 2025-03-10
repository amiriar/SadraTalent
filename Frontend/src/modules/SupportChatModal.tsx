import { Drawer, Box, TextField, InputAdornment } from "@mui/material";
import { IoCloseSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import { Message, Recipient, Room, Sender } from "./types/types";
import { Roles } from "../shared/enum";
import { MessageBubble } from "./SupportMessageBubble";
import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { FaPlus } from "react-icons/fa";
import SupportTopicModal from "./SupportTopicModal";

interface SupportChatModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  messages: Message[];
  sender: Sender | null;
  onlineUsers: Recipient[];
  room: Room | string;
  socket: typeof Socket | null;
  publicName: string;
  replyMessage: Message | null;
  setReplyMessage: (message: Message | null) => void;
}

export default function SupportChatModal({
  open,
  setOpen,
  messages: initialMessages,
  sender,
  onlineUsers,
  room,
  socket,
  publicName,
  replyMessage,
  setReplyMessage,
}: SupportChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  const getInitialMessages = () => [
    {
      _id: "67c2bbecc28f8a52183bccf2",
      sender: {
        _id: "999999999999999999999997",
        phone: "0900000000",
        profile: "public/static/sadra.jpg",
        username: "پشتیبانی صدرا",
        role: "ADMIN",
      },
      receiver: {
        _id: "67bc260787c2c4d7009b3358",
        phone: "09102711050",
        profile:
          "public/uploads/file/persona.jpg-1740966460061-9717400d-6145-45ba-8bfa-fbd148d0907b.jpg",
        username: "پشتیبانی صدرا",
        role: "ADMIN",
      },
      content: "به سامانه پشتیبانی صدرا خوش آمدید",
      ...getDefaultMessageAttributes(),
    },
    {
      _id: "999999999999999999999998",
      sender: {
        _id: "999999999999999999999999",
        phone: "0900000000",
        profile: "public/static/sadra.jpg",
        username: "پشتیبانی صدرا",
        role: "ADMIN",
      },
      receiver: {
        _id: "67bc260787c2c4d7009b3358",
        phone: "09102711050",
        profile:
          "public/uploads/file/persona.jpg-1740966460061-9717400d-6145-45ba-8bfa-fbd148d0907b.jpg",
        username: "پشتیبانی صدرا",
        role: "ADMIN",
      },
      content: "برای اتصال به یک پشتیبان، اولین پیام خود را ارسال کنید.",
      ...getDefaultMessageAttributes(),
    },
  ];

  const getDefaultMessageAttributes = () => ({
    room: "",
    status: "seen",
    isPinned: false,
    isEdited: false,
    isDeleted: false,
    isForwarded: false,
    deletedBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    replyTo: null,
    isSending: false,
    publicName: "پشتیبانی صدرا",
  });

  const handleReplyMessage = (message: Message) => {
    setReplyMessage(message);
  };

  useEffect(() => {
    setMessages(getInitialMessages());

    const intervalId = setInterval(() => {
      const onlineOperatorCount = onlineUsers.filter(
        (ou) => ou.role === Roles.Support
      ).length;

      const newMessage: Message = {
        _id: "999999999999999999999999",
        sender: {
          _id: "999999999999999999999999",
          phone: "0900000000",
          profile: "public/static/sadra.jpg",
          username: "پشتیبانی صدرا",
          role: "ADMIN",
        },
        receiver: {
          _id: "67bc260787c2c4d7009b3358",
          phone: "09102711050",
          profile:
            "public/uploads/file/persona.jpg-1740966460061-9717400d-6145-45ba-8bfa-fbd148d0907b.jpg",
          username: "پشتیبانی صدرا",
          role: "ADMIN",
        },
        content: `تعداد پشتیبان های آنلاین: ${onlineOperatorCount}`,
        ...getDefaultMessageAttributes(),
      };

      setMessages((prev) => [
        ...prev.filter((msg) => msg._id !== newMessage._id),
        newMessage,
      ]);

      if (onlineOperatorCount > 0) {
        clearInterval(intervalId);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [onlineUsers]);

  const [message, setMessage] = useState("");

  const sendMessage = (e: any) => {
    e.preventDefault();
    if (!message.trim()) return alert("Please write something down.");

    if (socket && room) {
      const tempId = uuidv4();
      const messageData: Message = {
        tempId,
        // @ts-ignore
        sender: {
          _id: sender?._id ?? "",
          username: sender?.username ?? "unknown",
        },
        content: message,
        room: typeof room === "string" ? room : room._id,
        publicName: publicName,
        isSending: true,
      };

      if (replyMessage) {
        // @ts-ignore
        messageData.replyTo = replyMessage?._id ?? null;
      }

      // if (recipient) {
      //   messageData.receiver = recipient?._id;
      // }

      // if (editMessage) {
      //   messageData._id = editMessage._id;
      //   setEditMessage(null);

      //   socket.emit("messages:editMessage", { messageData });

      //   setMessages((prevMessages: Message[]) =>
      //     prevMessages.map((msg) =>
      //       msg._id === editMessage._id
      //         ? { ...msg, ...messageData, isSending: true }
      //         : msg
      //     )
      //   );
      // } else {
      //   socket.emit("messages:sendMessage", messageData);

      //   setMessages((prevMessages: Message[]) => [
      //     ...prevMessages,
      //     messageData,
      //   ]);
      //   setReplyMessage(null);
      // }

      socket.emit("support:sendMessage", messageData);

      setMessages((prevMessages: Message[]) => [...prevMessages, messageData]);

      setMessage("");
    } else {
      alert("Please select a room or user to send the message.");
    }
  };

  const [selectSupportTopicModal, setSelectSupportTopicModal] = useState(false);
  const checkRoomAvailable = (room: Room | string) => {
    setSelectSupportTopicModal(true);
  };

  const topics = [
    {
      id: "1",
      name: "Technical Support",
      operators: [
        { id: "op1", name: "Alice", isOnline: true },
        { id: "op2", name: "Bob", isOnline: false },
      ],
    },
    {
      id: "2",
      name: "Billing",
      operators: [{ id: "op3", name: "Charlie", isOnline: true }],
    },
  ];

  return (
    <>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: 400,
            padding: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "15px",
            }}
          >
            <h3>Support Chat</h3>
            <FaPlus
              size={25}
              cursor="pointer"
              onClick={() => checkRoomAvailable(room)}
            />
            <IoCloseSharp
              size={25}
              cursor="pointer"
              onClick={() => setOpen(false)}
            />
          </div>

          <div className="messages">
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id || msg.tempId}
                msg={msg}
                sender={sender}
              />
            ))}
          </div>
        </Box>
        <Box>
          <form
            className="message-input"
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
            onSubmit={sendMessage}
          >
            <TextField
              value={message}
              sx={{ fontFamily: "IranYekan" }}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!room}
              placeholder={
                !room ? "click here to start chat!" : "Type your message..."
              }
              fullWidth
              variant="outlined"
              InputProps={{
                // startAdornment: (
                //   <InputAdornment position="start">
                //     <input
                //       type="file"
                //       accept="image/*,video/*"
                //       style={{ display: "none", fontFamily: "IranYekan" }}
                //       id="file-upload"
                //       onChange={uploadFileHandler}
                //     />
                //     <label
                //       htmlFor="file-upload"
                //       style={{
                //         cursor: "pointer",
                //         display: room ? "flex" : "none",
                //         alignItems: "center",
                //         justifyContent: "center",
                //         position: "relative",
                //         top: "4px",
                //       }}
                //     >
                //       <MdOutlineAttachFile size={24} style={{ padding: "5px" }} />
                //     </label>
                //   </InputAdornment>
                // ),
                endAdornment: (
                  <InputAdornment position="end">
                    <button
                      type="button"
                      disabled={!room}
                      style={{
                        border: "none",
                        background: "none",
                        display: room ? "flex" : "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    ></button>

                    <button
                      type="submit"
                      disabled={!room}
                      style={{
                        border: "none",
                        background: "none",
                        display: room ? "flex" : "none",
                        cursor: "pointer",
                        padding: 0,
                        marginLeft: "20px",
                      }}
                    >
                      {/* {editMessage ? (
                      <MdOutlineModeEditOutline style={styles.icon} />
                    ) : (
                      <IoSend style={styles.icon} />
                    )} */}
                    </button>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </Box>
      </Drawer>
      <SupportTopicModal
        topics={topics}
        socket={socket}
        selectSupportTopicModal={selectSupportTopicModal}
        setSelectSupportTopicModal={setSelectSupportTopicModal}
      />
    </>
  );
}

const styles = {
  icon: {
    fontSize: "24px",
    color: "#333",
    cursor: "pointer",
  },
};
