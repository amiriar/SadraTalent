import { useState } from "react";
import { Modal, Box, TextField, InputAdornment, Divider } from "@mui/material";
import { IoMdSearch } from "react-icons/io";
import { Message, Room, Sender } from "./types/types";
import { formatDistanceToNow } from "date-fns";

const SearchModal = ({
  open,
  onClose,
  onSearch,
  room,
  foundMessages,
  sender,
}: {
  open: boolean;
  onClose: () => void;
  onSearch: any;
  room: Room | string;
  foundMessages: Message[];
  sender: Sender | null;
}) => {
  const [value, setValue] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      style={{ maxHeight: "75vh", margin: "auto auto", overflow: "scroll" }}
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
          p: 3,
          borderRadius: 2,
          maxHeight: "80vh", // Limit the height of the modal
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Search input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch({ word: value, room });
          }}
          style={{ marginBottom: "10px" }}
        >
          <TextField
            fullWidth
            placeholder="Search..."
            onChange={(e) => setValue(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" style={{ cursor: "pointer" }}>
                  <IoMdSearch
                    size={25}
                    onClick={() => onSearch({ word: value, room })}
                  />
                </InputAdornment>
              ),
            }}
          />
        </form>

        {/* Scrollable messages container */}
        {foundMessages.length > 0 && (
          <div
            style={{
              overflowY: "auto", // Enable vertical scrolling
              maxHeight: "60vh", // Limit the height of the scrollable area
              paddingBottom: "10px", // Add padding to the bottom for better UX
            }}
          >
            {foundMessages.map((message: Message) => {
              return (
                <div key={message._id}>
                  <h3>
                    {message.sender?.username === sender?.username
                      ? "You"
                      : message.sender?.username}{" "}
                    {"->"}{" "}
                    {message.receiver
                      ? message.receiver?.username === sender?.username
                        ? "You"
                        : message.receiver?.username
                      : typeof room === "object"
                      ? room?.name
                      : "Error"}
                  </h3>
                  <p>Content: {message.content}</p>
                  <p>
                    Sent in:{" "}
                    {formatDistanceToNow(
                      new Date(message.createdAt ? message.createdAt : ""),
                      {
                        addSuffix: true,
                        includeSeconds: true,
                      }
                    )}
                  </p>
                  <Divider />
                </div>
              );
            })}
          </div>
        )}
      </Box>
    </Modal>
  );
};

export default SearchModal;
