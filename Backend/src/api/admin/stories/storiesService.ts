import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";
import { IStory } from "./storiesSchema";
import { AdminStoriesRepository } from "./storiesRepository";

export class AdminStoriesService {
  #storiesRepository: AdminStoriesRepository;

  constructor(repository: AdminStoriesRepository = new AdminStoriesRepository()) {
    this.#storiesRepository = repository;
  }

  async getAllStories(
    page: string,
    limit: string,
    isDeleted: boolean
  ): Promise<ServiceResponse<IStory[] | null>> {
    try {
      const stories = await this.#storiesRepository.getAllStories(
        page,
        limit,
        isDeleted
      );

      if (!stories || stories.length === 0) {
        return ServiceResponse.failure(
          "No stories found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<IStory[]>(
        "stories retrieved successfully",
        stories
      );
    } catch (ex) {
      const errorMessage = `Error retrieving stories: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving stories",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getStoriesById(
    roomId: string
  ): Promise<ServiceResponse<IStory | null>> {
    try {
      const stories = await this.#storiesRepository.getStoriesById(roomId);

      if (!stories) {
        return ServiceResponse.failure(
          "No stories found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<IStory>(
        "stories retrieved successfully",
        stories
      );
    } catch (ex) {
      const errorMessage = `Error retrieving stories: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving stories",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteStoryById(
    storyId: string
  ): Promise<ServiceResponse<IStory | null>> {
    try {
      const deletedStory = await this.#storiesRepository.deleteStoryById(
        storyId
      );

      if (!deletedStory) {
        return ServiceResponse.failure(
          "Story not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success(
        "Story deleted successfully",
        deletedStory
      );
    } catch (ex) {
      const errorMessage = `Error deleting story: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while deleting story",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateStoryById(
    storyId: string,
    newData: IStory
  ): Promise<ServiceResponse<IStory | null>> {
    try {
      const updatedStory = await this.#storiesRepository.updateStoryById(
        storyId,
        newData
      );

      if (!updatedStory) {
        return ServiceResponse.failure(
          "Story not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<IStory>(
        "Story updated successfully",
        updatedStory
      );
    } catch (ex) {
      const errorMessage = `Error updating story: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while updating story",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const adminStoriesService = new AdminStoriesService();
