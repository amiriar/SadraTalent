import StoryModel from "../admin/stories/storiesSchema";
import { IStory } from "../admin/stories/storiesSchema";

export class StoriesRepository {
  async getAllStories(
    page: string,
    limit: string,
    isDeleted: boolean,
    userId: string
  ): Promise<IStory[] | null> {
    const skip = parseInt(page) * parseInt(limit) - parseInt(limit);
    return await StoryModel.find({ isDeleted, user: userId })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();
  }

  async getStoriesById(
    storyId: string,
    userId: string
  ): Promise<IStory | null> {
    return await StoryModel.findOne({ _id: storyId, user: userId }).exec();
  }

  async deleteStoryById(
    storyId: string,
    userId: string
  ): Promise<IStory | null> {
    return await StoryModel.findOneAndUpdate(
      { _id: storyId, user: userId },
      {
        isDeleted: true,
      }
    ).exec();
  }

  async updateStoryById(
    storyId: string,
    newData: IStory,
    userId: string
  ): Promise<IStory | null> {
    return await StoryModel.findOneAndUpdate(
      { _id: storyId, user: userId },
      newData,
      {
        new: true,
      }
    ).exec();
  }
}
