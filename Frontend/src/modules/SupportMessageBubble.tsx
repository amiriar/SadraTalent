import { Avatar } from "@mui/material";
import { CiClock2 } from "react-icons/ci";
import { Message, Sender } from "./types/types";

export function MessageBubble({
  msg,
  sender,
}: {
  msg: Message;
  sender: Sender | null;
}) {
  const isSent = msg.sender._id === sender?._id;

  return (
    <div className={`message-container`}>
      <div
        className={`message ${isSent ? "sent" : "received"}`}
        style={{ minWidth: "200px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: isSent ? "end" : "start",
            flexDirection: isSent ? "row-reverse" : "row",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            fontFamily: "IranYekan",
          }}
        >
          {!isSent && (
            <Avatar
              src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                msg.sender.profile
              }`}
              alt={msg.sender.username}
              className="avatar"
            />
          )}
          <p>{isSent ? "You" : msg.sender.username}</p>
        </div>

        {msg.replyTo && (
          <div
            className="message-reply"
            style={{
              backgroundColor: isSent ? "#c5e8fa" : "#f9ede4",
            }}
          >
            <p>{msg.replyTo?.sender?.username || "Unknown"}</p>
            <p>
              {msg.replyTo.file
                ? "File"
                : msg.replyTo.voice
                ? "Voice Message"
                : msg.replyTo.content}
            </p>
          </div>
        )}

        <p
          dir="rtl"
          style={{
            textAlign: isSent ? "right" : "left",
            fontFamily: "IranYekan",
            fontSize: "0.9rem",
          }}
        >
          {msg.content}
        </p>

        <p
          className="timestamp"
          style={{ textAlign: isSent ? "left" : "right", margin: "5px 0" }}
        >
          {msg.isSending || !msg.createdAt ? (
            <CiClock2 size={10} />
          ) : (
            new Date(msg.createdAt).toLocaleTimeString()
          )}
        </p>

        {msg.voice && (
          <audio controls style={{ width: "100%" }}>
            <source
              src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                typeof msg.voice === "object" ? msg.voice.filePath : ""
              }`}
              type="audio/mp3"
            />
            Your browser does not support the audio element.
          </audio>
        )}

        {msg.file && (
          <a
            href={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
              typeof msg.file === "object" ? msg.file.filePath : ""
            }`}
            target="_blank"
            rel="noreferrer"
          >
            {typeof msg.file === "object" ? msg.file.filePath : ""}
          </a>
        )}
      </div>
    </div>
  );
}
