import { HTTPSTATUS } from "../config/http.config.js";
import { AppError } from "../utils/app-error.js";
import { ZodError } from "zod";

export const errorHandler = (error, req, res, next) => {
  console.log("Error occurred on PATH:", req.path);
  console.error(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  if (error instanceof ZodError) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Validation Error",
      errors: (error.errors || []).map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
    });
  }

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: error?.message || "Unknown error occurred",
  });
};
