import StoryModel, { IStory } from "./storiesSchema";

export class StoriesRepository {
  async getAllStories(page: string, limit: string): Promise<IStory[] | null> {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    return await StoryModel.find({}).skip(skip).limit(parseInt(limit));
  }

  async getStoriesById(roomId: string): Promise<IStory | null> {
    return await StoryModel.findOne({
      _id: roomId,
    });
  }
}
