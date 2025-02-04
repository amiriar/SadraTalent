import StoryModel, { IStory } from "./storiesSchema";

export class AdminStoriesRepository {
  async getAllStories(
    page: string,
    limit: string,
    isDeleted: boolean
  ): Promise<IStory[] | null> {
    const skip = parseInt(page) * parseInt(limit) - parseInt(limit);
    return await StoryModel.find({ isDeleted })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();
  }

  async getStoriesById(storyId: string): Promise<IStory | null> {
    return await StoryModel.findById(storyId).exec();
  }

  async deleteStoryById(storyId: string): Promise<IStory | null> {
    return await StoryModel.findByIdAndUpdate(storyId, {
      isDeleted: true,
    }).exec();
  }

  async updateStoryById(
    storyId: string,
    newData: IStory
  ): Promise<IStory | null> {
    return await StoryModel.findByIdAndUpdate(storyId, newData, {
      new: true,
    }).exec();
  }
}
