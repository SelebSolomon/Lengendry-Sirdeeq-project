import { Request, Response, NextFunction } from "express";
import * as userService from "./user.service.js";
import catchAsync from "../../utils/catch-async.js";
import AppError from "../../utils/app-error.js";
import { response } from "../../utils/response.util.js";
import "../../types/index.js";

const filterObj = (body: Record<string, unknown>, ...allowedFields: string[]) =>
  Object.fromEntries(
    Object.entries(body).filter(([field]) => allowedFields.includes(field)),
  );

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.findById(req.user!.id);
  response(res, 200, user);
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.findById(req.params.id as string);
  response(res, 200, user);
});

export const getUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await userService.findAll();
  response(res, 200, users);
});

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.password || req.body.confirmPassword) {
      return next(
        new AppError(
          "This route is not for password updates. Use /update-password",
          400,
        ),
      );
    }

    const allowedField = ["userName", "email", "phone"];

    const filtered = filterObj(req.body, ...allowedField);
    await userService.updateOne(req.user!.id, filtered);
    response(res, 200, "Updated successfully");
  },
);

export const deleteMe = catchAsync(async (req: Request, res: Response) => {
  await userService.deactivateOne(req.user!.id);
  response(res, 200, null);
});

export const suspendUser = catchAsync(async (req: Request, res: Response) => {
  await userService.suspendOne(req.params.id as string);
  response(res, 200, null);
});

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.password || req.body.confirmPassword) {
      return next(
        new AppError("This route is not for password updates. Use /update-password", 400),
      );
    }

    const allowedFields = ["userName", "email", "phone", "role", "status", "isActive"];
    const filtered = filterObj(req.body, ...allowedFields);

    if (Object.keys(filtered).length === 0) {
      return next(new AppError("No valid fields provided", 400));
    }

    const user = await userService.updateOne(req.params.id as string, filtered);
    response(res, 200, user);
  },
);

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.deleteOne(req.params.id as string);
  res.status(204).send();
});
