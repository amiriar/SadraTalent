import MessageModel from "@/api/admin/messages/messagesSchema";
import StoryModel from "@/api/admin/stories/storiesSchema";
import UserModel from "@/api/admin/user/userSchema";
import mongoose from "mongoose";
import { Socket, Server } from "socket.io";

export const storiesEvents = (
  socket: Socket,
  io: Server,
  userSocketId: string,
  userId: string,
  onlineUsers: Map<string, any> = new Map()
) => {
  socket.on("stories:getStories", async () => {
    try {
      // this gets all of the users, but in production we want people that are in the users contacts
      const usersWithStories = await UserModel.find({
        stories: { $exists: true, $ne: null },
      })
        .populate({
          path: "stories",
          match: {
            expireAt: { $gt: new Date() },
            isDeleted: false,
          },
          select: "-__v",
          populate: {
            path: "file", // Populating the `file` field inside `stories`
            model: "Upload", // Assuming `Upload` is the model name
            select: "-__v", // Exclude version key if needed
          },
        })
        .select("_id username profile stories")
        .lean();

      const response = usersWithStories
        .filter(
          (user) => Array.isArray(user.stories) && user.stories.length > 0
        )
        .map((user) => ({
          _id: user._id,
          username: user.username,
          profile: user.profile,
          // @ts-ignore
          stories: user?.stories?.map((story: IStory) => ({
            ...story,
            likesCount: story.likes.length,
          })),
        }));

      socket.emit("stories:getStoriesResponse", response);
    } catch (error) {
      console.error("Error fetching user stories:", error);
      socket.emit("error", { message: "Failed to fetch stories" });
    }
  });

  socket.on(
    "stories:usersSeenStory",
    async ({ storyId }: { storyId: string }) => {
      try {
        const story = await StoryModel.findById(storyId)
          .populate({
            path: "seenBy",
            select: "_id username profile",
          })
          .populate({
            path: "likes",
            select: "_id username profile",
          });
          console.log(story?.likes);

        if (!story) {
          throw new Error("Story not found");
        }

        const filteredSeenBy = story.seenBy.filter(
          (user) => user._id?.toString() !== userId
        );

        const filteredLikes = story.likes.filter(
          (user) => user._id?.toString() !== userId
        );

        

        socket.emit("stories:usersSeenStoryResponse", {
          seenBy: filteredSeenBy,
          likes: filteredLikes,
        });
      } catch (error) {
        console.error("Error fetching user stories:", error);
        socket.emit("error", { message: "Failed to fetch stories" });
      }
    }
  );

  socket.on(
    "stories:addStory",
    async ({ newDescription, newFilePath, newThumbnailPath, hyperLink }) => {
      try {
        const story = new StoryModel({
          description: newDescription,
          file: newFilePath,
          thumbnail: newFilePath,
          // thumbnail: newThumbnailPath,
          hyperLink: hyperLink,
          user: userId,
          isDeleted: false,
          expireAt: new Date(new Date().setHours(new Date().getHours() + 24)),
        });
        await story.save();

        await UserModel.findByIdAndUpdate(userId, {
          $addToSet: { stories: story._id },
        });

        const usersWithStories = await UserModel.find({
          stories: { $exists: true, $ne: null },
        })
          .populate({
            path: "stories",
            match: {
              expireAt: { $gt: new Date() },
              isDeleted: false,
            },
            select: "-__v",
          })
          .select("_id username profile stories")
          .lean();

        const response = usersWithStories
          .filter(
            (user) => Array.isArray(user.stories) && user.stories.length > 0
          )
          .map((user) => ({
            _id: user._id,
            username: user.username,
            profile: user.profile,
            stories: user.stories,
          }));

        socket.volatile.broadcast.emit("stories:getStoriesResponse", response);
      } catch (error) {
        console.error("Error adding story:", error);
        socket.emit("error", { message: "Failed to add story" });
      }
    }
  );

  socket.on("stories:seenStory", async ({ storyId }: { storyId: string }) => {
    try {
      await StoryModel.findByIdAndUpdate(storyId, {
        $addToSet: { seenBy: userId },
      });
    } catch (error) {
      console.error("Error marking story as seen:", error);
      socket.emit("error", { message: "Failed to mark story as seen" });
    }
  });

  socket.on(
    "stories:toggleLikeStory",
    async ({ storyId }: { storyId: string }) => {
      try {
        const story = await StoryModel.findById(storyId);

        if (story?.likes.includes(new mongoose.Types.ObjectId(userId))) {
          const updatedStory = await StoryModel.findByIdAndUpdate(
            storyId,
            {
              $pull: { likes: userId },
            },
            { new: true }
          );

          socket.emit("stories:toggleLikeStory", {
            storyId,
            success: true,
            likes: updatedStory?.likes,
          });
        } else {
          const updatedStory = await StoryModel.findByIdAndUpdate(
            storyId,
            {
              $addToSet: { likes: userId },
            },
            { new: true }
          );

          socket.emit("stories:toggleLikeStory", {
            storyId,
            success: true,
            likes: updatedStory?.likes,
          });
        }
      } catch (error) {
        console.error("Error toggling like story:", error);
        socket.emit("error", { message: "Failed to toggle like story" });
      }
    }
  );

  socket.on(
    "stories:shareStory",
    async ({
      recipientId,
      storyId,
    }: {
      recipientId: string;
      storyId: string;
    }) => {
      try {
        const message = new MessageModel({
          sender: userId,
          recipient: recipientId,
          room: userId + "-" + recipientId,
          storyId: storyId,
        });

        await message.save();

        const populatedMessage = await message.populate(
          "storyId",
          "description file thumbnail hyperLink user expireAt"
        );
        socket.emit("stories:shareStoryResponse", populatedMessage);
      } catch (error) {
        console.error("Error sharing story:", error);
        socket.emit("error", { message: "Failed to share story" });
      }
    }
  );

  socket.on("stories:deleteStory", async (storyId: { storyId: string }) => {
    try {
      const story = await StoryModel.findByIdAndUpdate(storyId.storyId, {
        isDeleted: true,
      });
      if (story) {
        socket.emit("stories:deleteStoryResponse", {
          storyId,
          message: "Story deleted successfully",
        });
      } else {
        socket.emit("error", { message: "Failed to delete story" });
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      socket.emit("error", { message: "Failed to delete story" });
    }
  });
};
