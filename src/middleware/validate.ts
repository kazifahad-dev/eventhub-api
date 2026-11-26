import { RequestHandler } from "express";
import { ZodError, ZodType } from "zod";
import { AppError } from "../utils/AppError";

interface Schemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

type FieldError = { field: string; message: string };

const formatZodError = (error: ZodError): FieldError[] =>
  error.issues.map((issue) => ({
    field: issue.path.map(String).join(".") || "body",
    message: issue.message,
  }));

export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, _res, next) => {
    const errors: FieldError[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body ?? {});
      if (result.success) {
        req.body = result.data;
      } else {
        errors.push(...formatZodError(result.error));
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) errors.push(...formatZodError(result.error));
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) errors.push(...formatZodError(result.error));
    }

    if (errors.length > 0) {
      throw new AppError(400, "Validation Error", errors);
    }

    next();
  };