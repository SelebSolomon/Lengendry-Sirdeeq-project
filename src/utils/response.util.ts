import { Response } from "express";

export const response = (res: Response, statusCode: number, data: unknown) => {
  res.status(statusCode).json({
    status: statusCode < 400 ? "success" : "fail",
    data,
  });
};
