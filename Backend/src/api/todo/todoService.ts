import { TodoRepository } from "@/api/todo/todoRepository";
import type { ITodo } from "@/api/todo/todoSchema";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";
import moment from "jalali-moment"; // Add this import for Persian date handling

export class TodoService {
  private todoRepository: TodoRepository;

  constructor(repository: TodoRepository = new TodoRepository()) {
    this.todoRepository = repository;
  }

  // Retrieves all todos from the database
  async findAll(id: string): Promise<ServiceResponse<ITodo[] | null>> {
    try {
      const todos = await this.todoRepository.findAllAsync(id);
      if (!todos || todos.length === 0) {
        return ServiceResponse.failure("No Todos found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<ITodo[]>("Todos found", todos);
    } catch (ex) {
      const errorMessage = `Error finding all todos: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving todos.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Retrieves a single todo by their ID
  async findById(id: string): Promise<ServiceResponse<ITodo | null>> {
    try {
      const todo = await this.todoRepository.findByIdAsync(id);
      if (!todo) {
        return ServiceResponse.failure("Todo not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<ITodo>("Todo found", todo);
    } catch (ex) {
      const errorMessage = `Error finding todo with id ${id}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while finding todo.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Creates a new todo
  async create(todoData: Partial<ITodo>): Promise<ServiceResponse<ITodo | null>> {
    try {
      // Add the Persian date to the todo data
      const date = moment().locale("fa").format("YYYY/MM/DD HH:mm:ss");
      const todoWithDate = {
        ...todoData,
        date,
      };

      console.log(todoWithDate);

      const todo = await this.todoRepository.createAsync(todoWithDate);
      return ServiceResponse.success<ITodo>("Todo created successfully", todo);
    } catch (ex) {
      const errorMessage = `Error creating todo: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while creating the todo.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Updates an existing todo by ID
  async update(id: string, todoData: Partial<ITodo>): Promise<ServiceResponse<ITodo | null>> {
    try {
      const updatedTodo = await this.todoRepository.updateAsync(id, todoData);
      if (!updatedTodo) {
        return ServiceResponse.failure("Todo not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<ITodo>("Todo updated successfully", updatedTodo);
    } catch (ex) {
      const errorMessage = `Error updating todo with id ${id}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while updating the todo.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Deletes a todo by ID
  async delete(id: string): Promise<ServiceResponse<ITodo | null>> {
    try {
      const deletedTodo = await this.todoRepository.deleteAsync(id);
      if (!deletedTodo) {
        return ServiceResponse.failure("Todo not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<ITodo>("Todo deleted successfully", deletedTodo);
    } catch (ex) {
      const errorMessage = `Error deleting todo with id ${id}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while deleting the todo.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const todoService = new TodoService();
