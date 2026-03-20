import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/app-error.js";
import type {
  RegisterDto,
  LoginIdentifierDto,
  UpdatePasswordDto,
} from "./dto/auth.dto.js";

const safeUserSelect = {
  id: true,
  userName: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
};


export const hashPassword = (password: string) => bcrypt.hash(password, 12);

export const comparePassword = (plain: string, hashed: string) =>
  bcrypt.compare(plain, hashed);

export const register = async (data: RegisterDto) => {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { userName: data.userName },
        ...(data.phone ? [{ phone: data.phone }] : []),
      ],
    },
  });

  if (existing) throw new AppError("User already exists", 400);

  const hashedPassword = await hashPassword(data.password);

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  const result = {
    id: user.id,
    username: user.userName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    emailVerified: false,
    createdAt: user.createdAt,
    verificationToken, // raw token — sent in email, never stored
  };
  return result;
};

export const login = async (
  identifier: LoginIdentifierDto,
  password: string,
) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(identifier.email ? [{ email: identifier.email }] : []),
        ...(identifier.userName ? [{ userName: identifier.userName }] : []),
        ...(identifier.phone ? [{ phone: identifier.phone }] : []),
      ],
    },
  });

  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError("Invalid credentials", 401);
  }

  const result = {
    id: user.id,
    username: user.userName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    emailVerifed: false,
    createdAt: user.createdAt,
  };

  return result;
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Email does not exist", 404);

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return { email: user.email, resetToken };
};

export const resetPassword = async (token: string, password: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) throw new AppError("Token is invalid or expired", 400);

  return prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(password),
      passwordChangedAt: new Date(Date.now() - 1000),
      passwordResetToken: null,
      passwordResetExpires: null,
    },
    select: safeUserSelect,
  });
};

export const updatePassword = async ({
  userId,
  currentPassword,
  newPassword,
}: UpdatePasswordDto) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  if (!(await comparePassword(currentPassword, user.password))) {
    throw new AppError("Your current password is wrong", 401);
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      password: await hashPassword(newPassword),
      passwordChangedAt: new Date(Date.now() - 1000),
    },
    select: safeUserSelect,
  });
};
