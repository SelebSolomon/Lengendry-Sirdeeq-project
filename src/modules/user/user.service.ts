import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/app-error.js";

const publicUserFields = {
  id: true,
  userName: true,
  email: true,
  phone: true,
  gender: true,
  DOB: true,
  role: true,
  status: true,
  isActive: true,
  createdAt: true,
};

export const findById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserFields,
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const findAll = async () => {
  const users = await prisma.user.findMany({
    where: { isActive: true},
    select: { id: true, userName: true, email: true, role: true },
  });
  if (users.length === 0) throw new AppError("No users found", 404);
  return users;
};

export const updateOne = async (id: string, data: Record<string, unknown>) => {
  const user = await prisma.user.update({
    where: { id },
    data,
    select: publicUserFields,
  });
  return user;
};

export const deactivateOne = (id: string) =>
  prisma.user.update({ where: { id }, data: { isActive: false }, select: publicUserFields });

export const suspendOne = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);
  return prisma.user.update({ where: { id }, data: { status: "suspended" }, select: publicUserFields });
};

export const deleteOne = (id: string) =>
  prisma.user.delete({ where: { id } });
