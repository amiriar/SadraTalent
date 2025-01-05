import { Avatar } from "@mui/material";
import { Recipient, Sender } from "./types/types";

interface OnlineUsersProps {
  onlineUsers: Recipient[];
  pvHandler: (user: Recipient) => void;
  sender: Sender | null;
}

function OnlineUsers({ onlineUsers, pvHandler, sender }: OnlineUsersProps) {
  return (
    <ul className="users-list">
      {onlineUsers?.map((user) => (
        user.username && 
        <li
          key={user._id}
          onClick={() => pvHandler(user)}
          style={{ cursor: "pointer", padding: "2px" }}
        >
          <Avatar
            src={
              user._id === sender?._id
                ? `${
                    import.meta.env.VITE_BACKEND_BASE_URL
                  }/public/static/savedMessages/saved-messages.jpg`
                : `${import.meta.env.VITE_BACKEND_BASE_URL}/${user.profile}`
            }
            alt={user.username}
            className="avatar"
            sx={{
              border: user._id !== sender?._id ? "1.5px lightgreen solid" : "none",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>
              {user._id === sender?._id ? (
                "Saved Messages"
              ) : (
                <span>{user.username}</span>
              )}
              {/* <span>(Online)</span> */}
            </span>
            {user.customStatus ? (
              <span style={{ fontSize: "0.9rem", color: "#888" }}>
                ({user.customStatus})
              </span>
            ) : (
              <span style={{ fontSize: "0.9rem", color: "#888" }}>active</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default OnlineUsers;
