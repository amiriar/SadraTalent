import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { Recipient, Room } from "./types/types";
import { FiMoreVertical } from "react-icons/fi";
import React, { useState } from "react";

interface RoomModalProps {
  open: boolean;
  handleClose: () => void;
  room: Room | null;
  handleRemoveUser: (userId: string, roomId: string) => void;
  handlePromoteUser: (userId: string, roomId: string, newRole: string) => void;
  senderId: string;
  profileHandler: (recipient: Recipient | null, room: Room | string) => void;
}

const RoomModal: React.FC<RoomModalProps> = ({
  open,
  handleClose,
  room,
  handleRemoveUser,
  handlePromoteUser,
  senderId,
  profileHandler,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    userId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleRemoveClick = () => {
    if (selectedUser) {
      handleRemoveUser(selectedUser, room?._id || "");
      handleMenuClose();
    }
  };

  const handlePromoteClick = (newRole: string) => {
    if (selectedUser) {
      handlePromoteUser(selectedUser, room?._id || "", newRole);
      handleMenuClose();
    }
  };

  return (
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
        <Typography
          id="room-modal-title"
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ textAlign: "center" }}
        >
          {room?.name || "No Room Name"}
        </Typography>

        <Typography
          id="room-modal-description"
          sx={{
            mb: 2,
            direction: "rtl",
            fontFamily: "IranYekan",
            textAlign: "center",
          }}
        >
          {room?.bio || "No Room Bio"}
        </Typography>

        <Typography
          id="room-modal-description"
          sx={{
            mb: 2,
            direction: "rtl",
            fontFamily: "Poppins",
            textAlign: "center",
          }}
        >
          Current Room Status: {room?.type === "group" ? "Group" : "Channel"}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1">Participants</Typography>
        <List>
          {room?.participants.length ? (
            room.participants.map((participant: any) => (
              <ListItem key={participant.user._id}>
                <Avatar
                  src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                    participant.user.profile
                  }`}
                  alt={participant.user.username}
                  sx={{ marginRight: "10px", cursor: "pointer" }}
                  onClick={() => profileHandler(participant.user, room)}
                />
                <ListItemText
                  primary={participant.user.username}
                  sx={{ cursor: "pointer" }}
                  onClick={() => profileHandler(participant.user, room)}
                />
                <ListItemText
                  primary={
                    participant.role === "owner"
                      ? "Owner"
                      : participant.role === "admin"
                      ? "Admin"
                      : participant.nickname
                  }
                  sx={{ color: "#888", cursor: "pointer" }}
                  onClick={() => profileHandler(participant.user, room)}
                />
                {participant.user._id !== senderId && (
                  <IconButton
                    edge="end"
                    aria-label="more options"
                    onClick={(e) => handleMenuOpen(e, participant.user._id)}
                    sx={{ width: "50px", height: "50px" }}
                  >
                    <FiMoreVertical />
                  </IconButton>
                )}

                <Menu
                  anchorEl={anchorEl}
                  open={
                    Boolean(anchorEl) && selectedUser === participant.user._id
                  }
                  onClose={handleMenuClose}
                >
                  {/* Allow promotion to Admin */}
                  {participant.role === "member" && (
                    <MenuItem onClick={() => handlePromoteClick("admin")}>
                      Promote to Admin
                    </MenuItem>
                  )}

                  {/* Allow demotion to Member */}
                  {participant.role === "admin" && (
                    <MenuItem onClick={() => handlePromoteClick("member")}>
                      Demote to Member
                    </MenuItem>
                  )}

                  {/* Allow Remove */}
                  {(participant.role === "admin" ||
                    participant.role === "member") && (
                    <MenuItem onClick={handleRemoveClick}>Remove User</MenuItem>
                  )}
                </Menu>
              </ListItem>
            ))
          ) : (
            <Typography>No participants</Typography>
          )}
        </List>
      </Box>
    </Modal>
  );
};

export default RoomModal;
