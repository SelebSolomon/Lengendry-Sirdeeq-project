import { Request, Response, NextFunction } from "express";
import AppError from "../utils/app-error.js";
import {Prisma} from "../../generated/prisma/client.js"
const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Prisma: invalid field value / wrong enum / missing required field
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid field or value provided",
    });
  }

  // Prisma: known DB constraint errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const field = (err.meta?.target as string[])?.join(", ") ?? "field";
      return res.status(409).json({
        status: "fail",
        message: `${field} already exists`,
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        status: "fail",
        message: "Record not found",
      });
    }
  }

  // Unexpected errors — log but don't leak details
  console.error("ERROR:", err);
  res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

export default errorHandler;
