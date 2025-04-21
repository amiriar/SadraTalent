import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
} from "@mui/material";
import { Recipient, Sender, Room } from "./types/types";
import React, { useState } from "react";
import { ImProfile } from "react-icons/im";
import { ProfileModal } from "./ProfileModal";
import { Socket } from "socket.io-client";
import { formatDistanceToNow } from "date-fns";
interface UsersModalProps {
  open: boolean;
  handleClose: () => void;
  profileHandler: (recipient: Recipient | null, room: Room | string) => void;
  users: Recipient[];
  sender: Sender | null;
  selectedRecipient: Recipient | null;
  // setSelectedRecipient: (recipient: Recipient | null) => void;
  socket: typeof Socket;
  setRooms: (rooms: Room[]) => void;
}

const UsersModal: React.FC<UsersModalProps> = ({
  open,
  handleClose,
  profileHandler,
  users,
  sender,
  selectedRecipient,
  // setSelectedRecipient,
  socket,
  setRooms,
}) => {
  const [openProfileModal, setOpenProfileModal] = useState(false);
  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="room-modal-title"
        aria-describedby="room-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle1">Users</Typography>
          <List>
            {users?.length ? (
              users.map((user: Recipient) => {
                return (
                  <ListItem
                    key={user._id}
                    onClick={() => {
                      profileHandler(user, "");
                      setOpenProfileModal(true);
                    }}
                  >
                    <Avatar
                      src={
                        user._id === sender?._id
                          ? `${
                              import.meta.env.VITE_BACKEND_BASE_URL
                            }/public/static/savedMessages/saved-messages.jpg`
                          : `${import.meta.env.VITE_BACKEND_BASE_URL}/${
                              user.profile
                            }`
                      }
                      alt={user.username}
                      sx={{ marginRight: "10px", cursor: "pointer" }}
                      style={{
                        border: `2px solid ${
                          user.status === "online" ? "green" : "black"
                        }`,
                      }}
                    />
                    <ListItemText
                      primary={user.username}
                      sx={{ cursor: "pointer" }}
                    />
                    <ListItemText
                      primary={
                        user.status !== "online"
                          ? formatDistanceToNow(user.lastSeen ?? new Date(), {
                              addSuffix: true,
                              includeSeconds: true,
                            })
                          : "Online"
                      }
                      sx={{ color: "#888", cursor: "pointer" }}
                    />
                    <IconButton
                      edge="end"
                      aria-label="more options"
                      sx={{ width: "50px", height: "50px" }}
                    >
                      <ImProfile />
                    </IconButton>
                  </ListItem>
                );
              })
            ) : (
              <Typography>No users</Typography>
            )}
          </List>
        </Box>
      </Modal>
      {openProfileModal && (
        <ProfileModal
          recipient={selectedRecipient as Required<Recipient>}
          open={openProfileModal}
          handleClose={() => setOpenProfileModal(false)}
          sender={sender as Sender}
          socket={socket}
          setRooms={setRooms}
        />
      )}
    </>
  );
};

export default UsersModal;
