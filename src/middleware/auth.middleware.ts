import { prisma } from "../lib/prisma.js";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/app-error.js";
import catchAsync from "../utils/catch-async.js";
import { ENV } from "../config/env.config.js";
import jwt from "jsonwebtoken";
import "../types/index.js";
import { Role } from "../../generated/prisma/enums.js";

export const protect = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError("You are not logged in, please login to access this route", 401)
      );
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as jwt.JwtPayload;

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists", 401)
      );
    }

    // Check if password was changed after token was issued
    if (currentUser.passwordChangedAt) {
      const changedAt = Math.floor(currentUser.passwordChangedAt.getTime() / 1000);
      if (decoded.iat && decoded.iat < changedAt) {
        return next(
          new AppError("Password was recently changed, please login again", 401)
        );
      }
    }

    req.user = currentUser;
    next();
  }
);

export const restrictTo = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }
    next();
  };
};
