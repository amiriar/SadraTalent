import { Avatar } from "@mui/material";
import { IUser, Recipient } from "./types/types";

interface OnlineUsersProps {
  offlineUsers: Recipient[];
  pvHandler: (user: Recipient) => void;
}

function OfflineUsers({ offlineUsers, pvHandler }: OnlineUsersProps) {
  return (
    <div
      className="offline-users"
      style={{ marginTop: "15px", marginBottom: "20px" }}
    >
      <h3 style={{ marginBottom: "15px" }}>Offline Users</h3>
      <ul className="users-list">
        {offlineUsers.map((user) => (
          user.username &&
          <li
            key={user._id}
            onClick={() => pvHandler(user)}
            style={{ cursor: "pointer", padding: "2px" }}
          >
            <Avatar
              src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${user.profile}`}
              alt={user.username}
              className="avatar"
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span>{user.username}</span>
              <span style={{ fontSize: "0.75rem", color: "gray" }}>
                {user.lastSeen
                  ? ` ${new Date(user.lastSeen).toLocaleString()}`
                  : " (Offline)"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OfflineUsers;
