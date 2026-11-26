import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { UserRole } from "../types/express";

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    throw new AppError(401, "Authentication token is missing");
  }

  
  const token = header.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    throw new AppError(401, "Authentication token is missing");
  }

  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }

  if (
    typeof decoded === "string" ||
    typeof decoded.id !== "number" ||
    (decoded.role !== "attendee" && decoded.role !== "organizer")
  ) {
    throw new AppError(401, "Invalid or expired token");
  }

  req.user = { id: decoded.id, role: decoded.role };
  next();
};

export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "You do not have permission to perform this action");
    }

    next();
  };