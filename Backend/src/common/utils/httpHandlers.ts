import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, ZodSchema } from "zod";

import { ServiceResponse } from "@/common/models/serviceResponse";

export const handleServiceResponse = <T>(serviceResponse: ServiceResponse<T>, response: Response) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

export const validateRequest =
  (schema: ZodSchema, validateAll: boolean = false) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // If validateAll is true, validate the combined structure
      if (validateAll) {
        schema.parse({ body: req.body, query: req.query, params: req.params });
      } else {
        schema.parse(req.body); // Validate only the body by default
      }
      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      if (err instanceof ZodError) {
        // Log the validation error for debugging
        console.error("Validation Error:", err.errors);

        const errorMessage = `Invalid input: ${err.errors.map((e) => e.message).join(", ")}`;
        const statusCode = StatusCodes.BAD_REQUEST;
        const serviceResponse = ServiceResponse.failure(errorMessage, null, statusCode);
        return handleServiceResponse(serviceResponse, res);
      }

      // Handle unexpected errors
      console.error("Unexpected Error:", err);
      const serviceResponse = ServiceResponse.failure("Internal Server Error", null, StatusCodes.INTERNAL_SERVER_ERROR);
      return handleServiceResponse(serviceResponse, res);
    }
  };
