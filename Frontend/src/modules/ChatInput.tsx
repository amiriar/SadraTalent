import { InputAdornment, TextField } from "@mui/material";
import { MdOutlineAttachFile, MdOutlineModeEditOutline } from "react-icons/md";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Message } from "./types/types";
import { useState, useEffect } from "react";

const ChatInput = ({
  room,
  message,
  setMessage,
  sender,
  recipient,
  handleStartRecording,
  handleStopRecording,
  isRecording,
  socket,
  publicName,
  editMessage,
  setEditMessage,
  setReplyMessage,
  replyMessage,
  setMessages,
  setUploadFileProgress
}: any) => {
  const [inputDisabled, setInputDisabled] = useState(false);

  useEffect(() => {
    if (typeof room === "object") {
      if (room.name === "General") {
        setInputDisabled(false);
      } else {
        const currentParticipant = room.participants.find(
          (participant: any) => participant.user._id === sender._id
        );

        if (currentParticipant) {
          if (
            currentParticipant.role === "admin" ||
            currentParticipant.role === "owner"
          ) {
            setInputDisabled(false);
          } else {
            setInputDisabled(true);
          }
        } else {
          setInputDisabled(true);
        }
      }
    } else {
      setInputDisabled(false);
    }
  }, [room, sender]);

  const uploadFileHandler = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const senderData = {
        _id: sender?._id,
        username: sender?.username,
        profile: sender?.profile,
      };
      const recipientData = {
        _id: recipient?._id,
        username: recipient?.username,
        profile: recipient?.profile,
      };

      const formData = new FormData();
      formData.append("sender", JSON.stringify(senderData));
      recipient && formData.append("recipient", JSON.stringify(recipientData));
      formData.append("room", room);
      formData.append("file", file);

      let fileUrl = "";

      await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/messages/upload-file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: function (progressEvent: any) {
            setUploadFileProgress(0);
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadFileProgress(percentCompleted);
          },
        }
      ).then((res) => {
        setUploadFileProgress(0);
        fileUrl = res.data.fileUrl;
      }).catch(() => {
        setUploadFileProgress("در فرایند بارگزاری مشکلی پیش آمد !");
      });

      socket?.emit("fileUpload", {
        fileUrl: fileUrl,
        sender: senderData,
        room,
        ...(recipientData && { recipient: recipientData }),
      });
      
      setUploadFileProgress(0);

    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadFileProgress("Upload failed!");
    }
  };

  const sendMessage = (e: any) => {
    e.preventDefault();
    if (!message.trim()) return alert("Please write something down.");

    if (socket && room) {
      const tempId = uuidv4();
      const messageData: Partial<Message> = {
        tempId,
        sender: {
          _id: sender?._id ?? "",
          username: sender?.username ?? "unknown",
        },
        content: message,
        room: room,
        publicName: publicName,
        isSending: true, // Set the message as "sending"
      };

      if (replyMessage) {
        messageData.replyTo = replyMessage._id;
      }

      if (recipient) {
        // @ts-ignore
        messageData.recipient = {
          _id: recipient._id,
        };
      }

      if (editMessage) {
        messageData._id = editMessage._id;
        setEditMessage(null);

        // Emit edit message
        socket.emit("editMessage", { messageData });

        // Update message state immediately for user feedback
        setMessages((prevMessages: Message[]) =>
          prevMessages.map((msg) =>
            msg._id === editMessage._id
              ? { ...msg, ...messageData, isSending: true }
              : msg
          )
        );
      } else {
        // Emit send message
        socket.emit("sendMessage", messageData);

        // Update message state immediately for user feedback
        setMessages((prevMessages: Message[]) => [
          ...prevMessages,
          messageData,
        ]);
        setReplyMessage(null);
      }

      setMessage("");
    } else {
      alert("Please select a room or user to send the message.");
    }
  };

  return (
    <>
     
    <form
      className="message-input"
      style={{ display: "flex", alignItems: "center", flexDirection: "column" }}
      onSubmit={sendMessage}
    >
      <TextField
        value={room ? message : ""}
        sx={{ fontFamily: "IranYekan" }}
        onChange={(e) => setMessage(e.target.value)}
        disabled={inputDisabled} // Disable input if the user is not an admin or owner
        placeholder={
          inputDisabled
            ? "Only admins can send messages"
            : room
            ? "Type your message..."
            : "Join a room to send a message!"
        }
        fullWidth
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <input
                type="file"
                accept="image/*,video/*"
                style={{ display: "none", fontFamily: "IranYekan" }}
                id="file-upload"
                onChange={uploadFileHandler}
              />
              <label
                htmlFor="file-upload"
                style={{
                  cursor: "pointer",
                  display: room ? "flex" : "none",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  top: "4px",
                }}
              >
                <MdOutlineAttachFile size={24} style={{ padding: "5px" }} />
              </label>
            </InputAdornment>
          ),
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
              >
                {!isRecording ? (
                  <FaMicrophone
                    style={styles.icon}
                    onClick={handleStartRecording}
                  />
                ) : (
                  <FaStop style={styles.icon} onClick={handleStopRecording} />
                )}
              </button>

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
                {editMessage ? (
                  <MdOutlineModeEditOutline style={styles.icon} />
                ) : (
                  <IoSend style={styles.icon} />
                )}
              </button>
            </InputAdornment>
          ),
        }}
      />
    </form>
    </>
  );
};

const styles = {
  icon: {
    fontSize: "24px",
    color: "#333",
    cursor: "pointer",
  },
};

export default ChatInput;
