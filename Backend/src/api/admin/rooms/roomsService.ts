import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";
import { RoomRepository } from "./roomsRepository";
import { IRoom } from "./roomsSchema";

export class RoomsService {
  #roomsRepository: RoomRepository;

  constructor(repository: RoomRepository = new RoomRepository()) {
    this.#roomsRepository = repository;
  }

  async getAllRooms(
    page: string,
    limit: string
  ): Promise<ServiceResponse<IRoom[] | null>> {
    try {
      const rooms = await this.#roomsRepository.getAllRooms(page, limit);

      if (!rooms || rooms.length === 0) {
        return ServiceResponse.failure(
          "No rooms found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<IRoom[]>(
        "Rooms retrieved successfully",
        rooms
      );
    } catch (ex) {
      const errorMessage = `Error retrieving rooms: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving rooms",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateRoomById(
    roomId: string,
    newData: any
  ): Promise<ServiceResponse<IRoom | null>> {
    try {
      const rooms = await this.#roomsRepository.updateRoomById(roomId, newData);

      if (!rooms) {
        return ServiceResponse.failure(
          "No rooms found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<IRoom>(
        "Rooms retrieved successfully",
        rooms
      );
    } catch (ex) {
      const errorMessage = `Error retrieving rooms: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving rooms",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteRoomById(roomId: string): Promise<ServiceResponse<boolean>> {
    try {
      const rooms = await this.#roomsRepository.deleteRoomById(roomId);

      if (!rooms) {
        return ServiceResponse.failure(
          "No rooms found",
          false,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<boolean>(
        "Rooms retrieved successfully",
        true
      );
    } catch (ex) {
      const errorMessage = `Error retrieving rooms: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving rooms",
        false,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getRoomById(roomId: string): Promise<ServiceResponse<IRoom | null>> {
    try {
      const rooms = await this.#roomsRepository.getRoomById(roomId);

      if (!rooms) {
        return ServiceResponse.failure(
          "No rooms found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<IRoom>(
        "Rooms retrieved successfully",
        rooms
      );
    } catch (ex) {
      const errorMessage = `Error retrieving rooms: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving rooms",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const roomsService = new RoomsService();
