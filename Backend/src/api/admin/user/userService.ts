import { UserRepository } from "@/api/admin/user/userRepository";
import type { IUser } from "@/api/admin/user/userSchema";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";

export class UserService {
  private userRepository: UserRepository;

  constructor(repository: UserRepository = new UserRepository()) {
    this.userRepository = repository;
  }

  // Retrieves all users from the database
  async findAll(): Promise<ServiceResponse<IUser[] | null>> {
    try {
      const users = await this.userRepository.findAllAsync();
      if (!users || users.length === 0) {
        return ServiceResponse.failure("No Users found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<IUser[]>("Users found", users);
    } catch (ex) {
      const errorMessage = `Error finding all users: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving users.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Retrieves a single user by their ID
  async findById(id: string): Promise<ServiceResponse<IUser | null>> {
    try {
      const user = await this.userRepository.findByIdAsync(id);
      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<IUser>("User found", user);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // // Creates a new user
  // async create(userData: Partial<IUser>): Promise<ServiceResponse<IUser | null>> {
  //   try {
  //     const user = await this.userRepository.createAsync(userData);
  //     return ServiceResponse.success<IUser>("User created successfully", user);
  //   } catch (ex) {
  //     const errorMessage = `Error creating user: ${(ex as Error).message}`;
  //     logger.error(errorMessage);
  //     return ServiceResponse.failure(
  //       "An error occurred while creating the user.",
  //       null,
  //       StatusCodes.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // Updates an existing user by ID
  async update(id: string, userData: Partial<IUser>): Promise<ServiceResponse<IUser | null>> {
    try {
      const updatedUser = await this.userRepository.updateAsync(id, userData);
      if (!updatedUser) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<IUser>("User updated successfully", updatedUser);
    } catch (ex) {
      const errorMessage = `Error updating user with id ${id}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while updating the user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Deletes a user by ID
  async delete(id: string): Promise<ServiceResponse<IUser | null>> {
    try {
      const deletedUser = await this.userRepository.deleteAsync(id);
      if (!deletedUser) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<IUser>("User deleted successfully", deletedUser);
    } catch (ex) {
      const errorMessage = `Error deleting user with id ${id}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while deleting the user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const userService = new UserService();
