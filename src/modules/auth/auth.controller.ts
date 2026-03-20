import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import "../../types/index.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "../../validators/auth.validator.js";
import * as authService from "./auth.service.js";
import catchAsync from "../../utils/catch-async.js";
import AppError from "../../utils/app-error.js";
import { ENV } from "../../config/env.config.js";
import { emailService } from "../../shared/email/email.service.js";

const signToken = (id: string) =>
  jwt.sign({ id }, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN as any });

const createSendToken = (
  user: Record<string, any>,
  statusCode: number,
  res: Response,
) => {
  const token = signToken(user.id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + ENV.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: "lax",
    secure: ENV.NODE_ENV === "production",
  });

  const {
    password,
    passwordResetToken,
    passwordResetExpires,
    passwordChangedAt,
    verificationToken,
    ...safeUser
  } = user;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user: safeUser },
  });
};

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success)
      return next(new AppError(result.error.issues[0].message, 400));

    const { confirmPassword, ...data } = result.data;
    const user = await authService.register(data);

    // send email verification
    await emailService.sendVerificationEmail(
      user.email,
      user.verificationToken,
      user.username,
    );
    // sending welcome email
    await emailService.sendWelcomeEmail(user.email, user.username);
    createSendToken(user, 201, res);
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success)
      return next(new AppError(result.error.issues[0].message, 400));

    const { password, ...identifier } = result.data;
    const user = await authService.login(identifier, password);

    createSendToken(user, 200, res);
  },
);

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = forgotPasswordSchema.safeParse(req.body);
    if (!result.success)
      return next(new AppError(result.error.issues[0].message, 400));

    const user = await authService.forgotPassword(result.data.email);

    // TODO: build resetURL and plug in your Email utility here
    await emailService.sendPasswordResetEmail(user.email, user.resetToken);
    res.status(200).json({ status: "success", message: "Token sent to email" });
  },
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success)
      return next(new AppError(result.error.issues[0].message, 400));

    const user = await authService.resetPassword(
      req.params.token as string,
      result.data.password,
    );

    createSendToken(user, 200, res);
  },
);

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = updatePasswordSchema.safeParse(req.body);
    if (!result.success)
      return next(new AppError(result.error.issues[0].message, 400));

    const user = await authService.updatePassword({
      userId: req.user!.id,
      currentPassword: result.data.passwordCurrent,
      newPassword: result.data.password,
    });

    createSendToken(user, 200, res);
  },
);
