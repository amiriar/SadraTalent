import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";
import { MessageRepository } from "./messagesRepository";
import { IMessage } from "./messagesSchema";
import { decrypt } from "@/common/helper/Helper";

export class MessageService {
  private messageRepository: MessageRepository;

  constructor(repository: MessageRepository = new MessageRepository()) {
    this.messageRepository = repository;
  }

  async getMessagesBetweenUsersByMongoId(
    senderId: string,
    receiverId: string,
    page: string,
    limit: string
  ): Promise<ServiceResponse<IMessage[] | null>> {
    try {
      if (!senderId || !receiverId) {
        return ServiceResponse.failure(
          "Sender ID and Receiver ID are required",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const messages =
        await this.messageRepository.getMessagesBetweenUsersByMongoId(
          senderId,
          receiverId,
          page,
          limit
        );

      if (!messages || messages.length === 0) {
        return ServiceResponse.failure(
          "No messages found between these users",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<IMessage[]>(
        "Messages retrieved successfully",
        messages
      );
    } catch (ex) {
      const errorMessage = `Error retrieving messages between users: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving messages",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getMessagesFromRoom(
    messageId: string,
    page: string,
    limit: string
  ): Promise<ServiceResponse<IMessage[] | null>> {
    try {
      if (!messageId) {
        return ServiceResponse.failure(
          "Sender ID and Receiver ID are required",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const messages = await this.messageRepository.getMessagesFromRoom(
        messageId,
        page,
        limit
      );

      if (!messages || messages.length === 0) {
        return ServiceResponse.failure(
          "No messages found between these users",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<IMessage[]>(
        "Messages retrieved successfully",
        messages
      );
    } catch (ex) {
      const errorMessage = `Error retrieving messages between users: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving messages",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async searchMessages(
    word: string,
    page: string,
    limit: string
  ): Promise<ServiceResponse<IMessage[] | null>> {
    try {
      const encryptedMessages = await this.messageRepository.getAllMessages(
        page,
        limit
      );
      if (!encryptedMessages || encryptedMessages.length === 0) {
        return ServiceResponse.success("No messages found", []);
      }

      const decryptedMessages = encryptedMessages.map((message: IMessage) => {
        const decryptedContent = decrypt(message.content);
        return { ...message.toObject(), content: decryptedContent };
      });

      const filteredMessages = decryptedMessages.filter((message: IMessage) =>
        message.content.toLowerCase().includes(word.toLowerCase())
      );

      return ServiceResponse.success(
        "Messages retrieved successfully",
        filteredMessages
      );
    } catch (error) {
      logger.error(`Error searching messages: ${(error as Error).message}`);
      return ServiceResponse.failure(
        "Failed to search messages",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteMessageById(
    messageId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      if (!messageId) {
        return ServiceResponse.failure(
          "Sender ID and Receiver ID are required",
          false,
          StatusCodes.BAD_REQUEST
        );
      }

      const messages = await this.messageRepository.deleteMessageById(
        messageId
      );

      if (!messages) {
        return ServiceResponse.failure(
          "No messages found between these users",
          false,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<boolean>(
        "Messages retrieved successfully",
        true
      );
    } catch (ex) {
      const errorMessage = `Error retrieving messages between users: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving messages",
        false,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const messageService = new MessageService();
