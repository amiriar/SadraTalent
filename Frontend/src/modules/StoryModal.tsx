import {
  Modal,
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { AiOutlineClose } from "react-icons/ai";
import { FaEye, FaHeart, FaRegHeart, FaRegTrashAlt } from "react-icons/fa";
import { IStory } from "./types/types";
import { ObjectId } from "mongoose";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { BiSolidShare } from "react-icons/bi";
import { GrShare } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import Swal from "sweetalert2";

const StoryModal = ({
  user,
  open,
  onClose,
  senderId,
  deleteHandler,
  currentStoryIndex,
  setCurrentStoryIndex,
  scoket,
  seenUsersHandler,
  seenStoryUser,
  linkHandler,
  likesStoryUser,
  onlineUsers,
  offlineUsers,
}: {
  user: {
    _id: string;
    username: string;
    profile: string;
    stories: {
      _id: ObjectId;
      description: string;
      file: string;
      thumbnail: string;
      hyperLink: string;
      createdAt: Date;
      updatedAt: Date;
      expireAt: Date;
      user: {
        _id: ObjectId;
        profile: string;
        username: string;
      };
      isDeleted: boolean;
      likes: ObjectId[];
    }[];
  } | null;
  senderId: string | undefined;
  open: boolean;
  onClose: () => void;
  deleteHandler: (storyId: string) => any;
  currentStoryIndex: number;
  setCurrentStoryIndex: any;
  scoket: any;
  seenUsersHandler: (storyId: string) => any;
  seenStoryUser: any[];
  linkHandler: (storyId: string) => any;
  likesStoryUser: any[];
  onlineUsers: any[];
  offlineUsers: any[];
  setIsCreateStoryModalOpen: any;
}) => {
  if (!user || !user.stories || user.stories.length === 0) return null; // Ensure stories exist

  const currentStory: IStory = user.stories[currentStoryIndex];

  const [seenUsersModalOpen, setSeenUsersModalOpen] = useState(false);
  const [likes, setLikes] = useState<ObjectId[]>(currentStory.likes); // Initialize likes state
  const [usersModalOpen, setUsersModalOpen] = useState(false); // New state for the users modal

  const handleNext = () => {
    if (currentStoryIndex < user.stories.length - 1) {
      setCurrentStoryIndex((prev: number) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev: number) => prev - 1);
    }
  };

  useEffect(() => {
    if (scoket && user && currentStory) {
      scoket.emit("stories:seenStory", { userId: senderId, storyId: currentStory._id });
    }
  }, [currentStory, scoket, user]);

  const toggleShape = (action: "like" | "unlike") => {
    if (action === "like") {
      // Cast senderId as ObjectId before adding
      setLikes((prevLikes) => [...prevLikes, senderId as unknown as ObjectId]);
    } else {
      setLikes((prevLikes) =>
        prevLikes.filter((id) => String(id) !== senderId)
      );
    }
  };

  // New function to handle opening the users modal
  const handleUsersModalOpen = () => {
    setUsersModalOpen(true);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="story-modal-title"
        aria-describedby="story-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
            width: { xs: "90%", sm: "70%", md: "50%" },
            maxHeight: "80%",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${user.profile}`}
                alt={user.username}
                sx={{ width: 56, height: 56, mr: 2 }}
              />
              <Typography variant="h6" component="span">
                {senderId !== user._id ? user.username : "You"}{" "}
                <span style={{ color: "gray", fontSize: "17px" }}>
                  (
                  {formatDistanceToNow(new Date(currentStory.createdAt), {
                    addSuffix: true,
                    includeSeconds: true,
                  })}
                  )
                </span>
              </Typography>
            </Box>
            <div>
              <IconButton
                sx={{ width: "50px", height: "50px" }}
                onClick={handleUsersModalOpen}
              >
                <BiSolidShare />
              </IconButton>
              {senderId === user._id && (
                <>
                  <IconButton
                    sx={{ width: "50px", height: "50px" }}
                    onClick={() => {
                      seenUsersHandler(String(currentStory._id));
                      setSeenUsersModalOpen(true);
                    }}
                  >
                    <FaEye />
                  </IconButton>
                  <IconButton
                    sx={{ width: "50px", height: "50px" }}
                    onClick={() => deleteHandler(String(currentStory?._id))}
                  >
                    <FaRegTrashAlt />
                  </IconButton>
                </>
              )}
              <IconButton
                sx={{ width: "50px", height: "50px" }}
                onClick={onClose}
              >
                <AiOutlineClose />
              </IconButton>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Button
              onClick={handlePrev}
              disabled={currentStoryIndex === 0}
              sx={{ maxWidth: "50px", height: "50px" }}
            >
              &lt;
            </Button>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {currentStory?.file && (
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor: "#000",
                    borderRadius: 2,
                    overflow: "hidden",
                    width: "100%",
                  }}
                >
                  <img
                    src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                      typeof currentStory.file === "object"
                        ? currentStory.file.filePath
                        : ""
                    }`}
                    alt="Story"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "400px",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              )}

              <Typography
                id="story-modal-description"
                variant="body1"
                dir="rtl"
                textAlign={"right"}
                sx={{ width: "100%" }}
                fontFamily={"IranYekan"}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h3>توضیحات: </h3>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => linkHandler(String(currentStory?._id))}
                  >
                    {likes.includes(senderId as unknown as ObjectId) ? (
                      <FaHeart
                        size={25}
                        color="red"
                        onClick={() => toggleShape("unlike")}
                      />
                    ) : (
                      <FaRegHeart
                        size={25}
                        onClick={() => toggleShape("like")}
                      />
                    )}
                  </span>
                </div>
                <p style={{ marginTop: "5px" }}>
                  {currentStory?.description || "توضیحات وجود ندارد."}
                </p>
                {currentStory.hyperLink && (
                  <a
                    href={currentStory.hyperLink}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      textDecoration: "none",
                      color: "blueviolet",
                      marginTop: "1rem",
                    }}
                    target="_blank"
                  >
                    بازکردن صفحه مورد نظر &nbsp;
                    <GrShare />
                  </a>
                )}
              </Typography>
            </Box>

            <Button
              onClick={handleNext}
              disabled={currentStoryIndex === user.stories.length - 1}
              sx={{ maxWidth: "50px", height: "50px" }}
            >
              &gt;
            </Button>
          </div>
        </Box>
      </Modal>

      {/* seen by and liked by modal */}
      <Modal
        open={seenUsersModalOpen}
        onClose={() => setSeenUsersModalOpen(false)}
        aria-labelledby="seen-users-modal-title"
        aria-describedby="seen-users-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
            width: { xs: "90%", sm: "70%", md: "50%" },
            maxHeight: "80%",
            overflowY: "auto",
          }}
        >
          <Typography id="seen-users-modal-title" variant="h6" component="h2">
            Seen By:
          </Typography>
          <List dense={true}>
            {seenStoryUser.map((user) => (
              <ListItem key={user._id}>
                <ListItemAvatar>
                  <Avatar
                    src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                      user.profile
                    }`}
                    alt={user.username}
                  />
                </ListItemAvatar>
                <ListItemText primary={user.username} />
              </ListItem>
            ))}
          </List>
          <Typography id="likes-users-modal-title" variant="h6" component="h2">
            Liked By:
          </Typography>
          <List dense={true}>
            {likesStoryUser.map((user) => (
              <ListItem key={user._id}>
                <ListItemAvatar>
                  <Avatar
                    src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                      user.profile
                    }`}
                    alt={user.username}
                  />
                </ListItemAvatar>
                <ListItemText primary={user.username} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>

      {/* New modal for online and offline users */}
      <Modal
        open={usersModalOpen}
        onClose={() => setUsersModalOpen(false)}
        aria-labelledby="users-modal-title"
        aria-describedby="users-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
            width: { xs: "90%", sm: "70%", md: "50%" },
            maxHeight: "80%",
            overflowY: "auto",
          }}
        >
          <Typography id="users-modal-title" variant="h6" component="h2">
            Users:
          </Typography>
          <Typography variant="h6" component="h3">
            Online Users:
          </Typography>
          <List dense={true}>
            {onlineUsers
              .filter((user) => user._id !== senderId)
              .map((user) => (
                <ListItem key={user._id}>
                  <ListItemAvatar>
                    <Avatar
                      src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                        user.profile
                      }`}
                      alt={user.username}
                    />
                  </ListItemAvatar>
                  <ListItemText primary={user.username} />
                  <IconButton
                    edge="end"
                    aria-label="send"
                    sx={{ width: "50px", height: "50px" }}
                    onClick={() => {
                      scoket.emit("shareStory", {
                        senderId: senderId,
                        recipientId: user._id,
                        storyId: currentStory._id,
                      });
                      setUsersModalOpen(false);
                      onClose();
                      Swal.fire({
                        icon: "success",
                        title: "Message Sent",
                        text: "Your message has been sent successfully!",
                      });
                    }}
                  >
                    <IoSend />
                  </IconButton>
                </ListItem>
              ))}
          </List>
          <Typography variant="h6" component="h3">
            Offline Users:
          </Typography>
          <List dense={true}>
            {offlineUsers
              .filter((user) => user._id !== senderId)
              .map((user) => (
                <ListItem key={user._id}>
                  <ListItemAvatar>
                    <Avatar
                      src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${
                        user.profile
                      }`}
                      alt={user.username}
                    />
                  </ListItemAvatar>
                  <ListItemText primary={user.username} />
                  <IconButton
                    edge="end"
                    aria-label="send"
                    sx={{ width: "50px", height: "50px" }}
                    onClick={() => {
                      scoket.emit("shareStory", {
                        senderId: senderId,
                        recipientId: user._id,
                        storyId: currentStory._id,
                      });
                      setUsersModalOpen(false);
                      onClose();
                      Swal.fire({
                        icon: "success",
                        title: "Message Sent",
                        text: "Your message has been sent successfully!",
                      });
                    }}
                  >
                    <IoSend />
                  </IconButton>
                </ListItem>
              ))}
          </List>
        </Box>
      </Modal>
    </>
  );
};

export default StoryModal;
