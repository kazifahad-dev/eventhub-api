import { ErrorRequestHandler, RequestHandler } from "express";
import { AppError } from "../utils/AppError";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({
      success: false,
      message: "Invalid JSON body",
    });
    return;
  }

  
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};