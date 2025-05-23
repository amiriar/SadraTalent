import {
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  Typography,
} from "@mui/material";
import { FaPaperPlane } from "react-icons/fa";
import { IUser, IMessage, Room, Sender } from "./types/types";
import { FaUserGroup } from "react-icons/fa6";
interface IForward {
  users: any[];
  openForwardModal: any;
  handleCloseForwardModal: any;
  ModalStyle: any;
  sender: Sender | null;
  selectedMessageToForward: IMessage | null;
  userRooms: Room[];
  forwardMessage: any;
}

export default function ForwardModal({
  users,
  openForwardModal,
  handleCloseForwardModal,
  ModalStyle,
  sender,
  selectedMessageToForward,
  userRooms,
  forwardMessage,
}: IForward) {
  return (
    <Modal
      open={openForwardModal}
      onClose={handleCloseForwardModal}
      aria-labelledby="forward-modal-title"
    >
      <Box sx={ModalStyle}>
        <Typography id="forward-modal-title" variant="h6" component="h2">
          Forward Message
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Rooms
        </Typography>
        <List>
          {userRooms.length > 0 ? (
            userRooms.map((room: Room) => (
              <ListItem
                key={room._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* <ListItemAvatar>
                  <Avatar
                    src={
                      user._id === sender?._id
                        ? `${import.meta.env.VITE_BACKEND_BASE_URL}/public/static/savedMessages/saved-messages.jpg`
                        : `${import.meta.env.VITE_BACKEND_BASE_URL}/${user.profile}`
                    }
                    alt={user.username}
                  />
                </ListItemAvatar> */}
                <ListItemAvatar>
                  <FaUserGroup
                    size={15}
                    style={{
                      background: "#65aee9",
                      padding: "10px",
                      borderRadius: "50%",
                    }}
                  />
                </ListItemAvatar>
                <ListItemText primary={room?.name} />
                <Button
                  onClick={() =>
                    forwardMessage(room, selectedMessageToForward, null)
                  }
                  sx={{ width: "100px" }}
                >
                  <FaPaperPlane size={20} />
                </Button>
              </ListItem>
            ))
          ) : (
            <Typography>No online users to forward the message.</Typography>
          )}
        </List>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Online Users
        </Typography>
        <List>
          {users?.length > 0 ? (
            users.map((user: IUser) => (
              <ListItem
                key={user?._id ?? ""}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <ListItemAvatar>
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
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    user.username === sender?.username
                      ? "Saved Messages"
                      : user.username
                  }
                />
                <Button
                  onClick={() =>
                    forwardMessage(user, selectedMessageToForward, user._id)
                  }
                  sx={{ width: "100px" }}
                >
                  <FaPaperPlane size={20} />
                </Button>
              </ListItem>
            ))
          ) : (
            <Typography>No online users to forward the message.</Typography>
          )}
        </List>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Offline Users
        </Typography>
        <List>
          {users?.length > 0 ? (
            users.map((user: IUser) => (
              <ListItem
                key={user._id}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <ListItemAvatar>
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
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={user.username}
                  // @ts-ignore
                  secondary={new Date(user?.lastSeen).toLocaleString()}
                />
                <Button
                  onClick={() =>
                    forwardMessage(user, selectedMessageToForward, user._id)
                  }
                  sx={{ width: "100px" }}
                >
                  <FaPaperPlane size={20} />
                </Button>
              </ListItem>
            ))
          ) : (
            <Typography>No offline users to forward the message.</Typography>
          )}
        </List>
      </Box>
    </Modal>
  );
}
