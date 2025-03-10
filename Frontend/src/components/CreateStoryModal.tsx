import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  LinearProgress,
} from "@mui/material";
import { TiTick } from "react-icons/ti";
// import { IStory } from "../modules/types/types";
import axios from "axios";
import { IUpload } from "../modules/types/types";

interface StoryModalProps {
  open: boolean;
  onClose: () => void;
  addStoryHandler: any;
  // currentStory: IStory[] | null;
  // setCurrentStory: any;
  senderProfile: string | undefined | IUpload;
}

const CreateStoryModal: React.FC<StoryModalProps> = ({
  open,
  onClose,
  addStoryHandler,
  senderProfile,
  // currentStory,
  // setCurrentStory,
}) => {
  const [newDescription, setNewDescription] = useState<string>("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [hyperLink, setHyperLink] = useState<string | null>("");
  const [newFilePath, setNewFilePath] = useState<string>("");
  const [newThumbnailPath, setNewThumbnailPath] = useState<
    string | undefined | IUpload
  >("");

  const [storyUploadProgress, setStoryUploadProgress] = useState<number>(0);
  // const [thumbnailUploadProgress, setThumbnailUploadProgress] =
  //   useState<number>(0);

  useEffect(() => {
    setNewThumbnailPath(senderProfile);
    uploader();
  }, [newFile /*, newThumbnail*/]);

  const uploader = async () => {
    if (newFile) {
      try {
        const formData = new FormData();
        formData.append("story", newFile);
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/upload/story`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
            onUploadProgress: (progressEvent) => {
              const total = progressEvent.total || 0;
              const current = progressEvent.loaded;
              setStoryUploadProgress(Math.round((current / total) * 100));
            },
          }
        );
        setNewFilePath(response.data.responseObject._id);
      } catch (error) {
        console.error("Error uploading story:", error);
      }
    }
    // if (newThumbnail) {
    //   try {
    //     const formData = new FormData();
    //     formData.append("thumbnail", newThumbnail);
    //     const response = await axios.post(
    //       `${
    //         import.meta.env.VITE_BACKEND_BASE_URL
    //       }/api/messages/upload-story-thubmnail`,
    //       formData,
    //       {
    //         headers: {
    //           "Content-Type": "multipart/form-data",
    //         },
    //         withCredentials: true,
    //         onUploadProgress: (progressEvent) => {
    //           const total = progressEvent.total || 0;
    //           const current = progressEvent.loaded;
    //           setThumbnailUploadProgress(Math.round((current / total) * 100));
    //         },
    //       }
    //     );
    //     setNewThumbnailPath(response.data);
    //   } catch (error) {
    //     console.error("Error uploading story thumbnail:", error);
    //   }
    // }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <DialogTitle>Story</DialogTitle>
        <button
          style={{
            width: "inherit",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() =>
            addStoryHandler({
              newDescription,
              newFilePath,
              newThumbnailPath,
              hyperLink,
            })
          }
        >
          <TiTick size={29} />
        </button>
      </div>
      <DialogContent>
        <input
          type="file"
          onChange={(e) =>
            setNewFile(e.target.files ? e.target.files[0] : null)
          }
          accept="*/*"
        />
        {newFile && (
          <LinearProgress variant="determinate" value={+storyUploadProgress} />
        )}

        {/* {newThumbnail && (
          <LinearProgress
            variant="determinate"
            value={+thumbnailUploadProgress}
          />
        )} */}
        <TextField
          label="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          fullWidth
          sx={{ marginTop: 1 }}
        />

        <div style={{ marginTop: "10px" }}>
          <label htmlFor="hl">Additional Link: </label>
          <input
            type="text"
            id="hl"
            placeholder="https://...."
            onChange={(e) => setHyperLink(e.target.value)}
          />
        </div>

        {/* {currentStory && (
          <div className="current-story" style={{ marginTop: "10px" }}>
            <strong>Current Story:</strong> {currentStory}
          </div>
        )} */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateStoryModal;
