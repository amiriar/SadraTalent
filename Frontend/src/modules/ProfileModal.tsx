import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Avatar,
} from "@mui/material";
import { AiFillMessage } from "react-icons/ai";
import { Recipient, Sender, Room } from "./types/types";
import { Socket } from "socket.io-client";
import { RoomTypes } from "../shared/enum";
export const ProfileModal = ({
  recipient,
  sender,
  open,
  handleClose,
  socket,
  setRooms,
}: {
  recipient: Recipient;
  sender: Sender;
  open: boolean;
  handleClose: () => void;
  socket: typeof Socket;
  setRooms: (rooms: Room[]) => void;
}) => {
  const pvHandler = (recipient: Recipient) => {
    socket?.emit("rooms:newPrivateRoom", {
      name: "PV:" + sender._id + "-" + recipient._id,
      type: RoomTypes.Private,
      participants: [sender._id, recipient._id],
    });
    
    socket?.on("rooms:newRoomResponse", (rooms: Room[]) => {
      setRooms(rooms);
    });
  };
  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <Avatar
        src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${recipient?.profile}`}
        alt={recipient?.username}
        sx={{
          width: "100%",
          height: "300px",
          borderRadius: "0",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        <DialogTitle>{recipient?.username}'s Profile</DialogTitle>
        <div
          style={{
            position: "absolute",
            right: 45,
            top: -20,
            background: "#4b95d4",
            borderRadius: "50%",
            height: "60px",
            width: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => pvHandler(recipient)}
        >
          <AiFillMessage size={30} color="white" />
        </div>
      </div>
      <DialogContent>
        {recipient?.customStatus && (
          <Typography variant="body1">
            status:{" "}
            <span style={{ fontFamily: "IranYekan" }}>
              {recipient?.customStatus}
            </span>
          </Typography>
        )}
        {recipient?.firstname && (
          <Typography variant="body1">
            First Name: {recipient?.firstname}
          </Typography>
        )}
        {recipient?.lastname && (
          <Typography variant="body1">
            Last Name: {recipient?.lastname}
          </Typography>
        )}
        <Typography variant="body1">Username: {recipient?.username}</Typography>
        {recipient?.email && (
          <Typography variant="body1">Email: {recipient?.email}</Typography>
        )}
        {recipient?.bio && (
          <Typography variant="body1">Bio: {recipient?.bio}</Typography>
        )}
        {recipient?.phoneNumber && (
          <Typography variant="body1">
            Phone: {recipient?.phoneNumber}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};
