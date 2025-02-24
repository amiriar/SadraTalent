import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { IoClose } from "react-icons/io5";
import { Room } from "./types/types";

interface EditRoomModalProps {
  open: boolean;
  onClose: () => void;
  room: Room;
  onSave: (updatedRoom: {
    name: string;
    bio: string;
    isGroup: boolean;
  }) => void;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({
  open,
  onClose,
  room,
  onSave,
}) => {
  const [name, setRoomName] = useState<string>(room?.name || "");
  const [bio, setBio] = useState<string>(room?.bio || "");
  const [isGroup, setIsGroup] = useState<boolean>(room?.isGroup || true); // Default to group

  const handleSave = () => {
    onSave({ name, bio, isGroup });
    onClose();
  };

  useEffect(() => {
    if (room) {
      setRoomName(room.name || "");
      setBio(room.bio || "");
      setIsGroup(room.isGroup); // Default to group if not set
    }
  }, [room]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={"center"}
          mb={2}
        >
          <Typography variant="h6">Edit Room</Typography>
          <IconButton onClick={onClose} sx={{ width: "50px", height: "50px" }}>
            <IoClose size={25} />
          </IconButton>
        </Box>

        <TextField
          label="Room Name"
          value={name}
          onChange={(e) => setRoomName(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 15 }}
        />

        <TextField
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 150 }}
        />

        <Typography variant="subtitle1" mt={2}>
          Room Type
        </Typography>
        <RadioGroup
          value={isGroup ? "group" : "channel"}
          onChange={(e) => setIsGroup(e.target.value === "group")}
          row
        >
          <FormControlLabel value="group" control={<Radio />} label="Group" />
          <FormControlLabel
            value="channel"
            control={<Radio />}
            label="Channel"
          />
        </RadioGroup>

        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditRoomModal;
