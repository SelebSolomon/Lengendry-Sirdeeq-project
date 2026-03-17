import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/app-error.js";
import { Role } from "../../../generated/prisma/enums.js";

export const submitRequest = async (
  userId: string,
  data: { businessName: string; businessDescription: string },
) => {
  const existing = await prisma.vendorRequest.findUnique({ where: { userId } });
  if (existing) {
    if (existing.status === "pending")
      throw new AppError("You already have a pending vendor request", 400);
    if (existing.status === "approved")
      throw new AppError("Your account is already a vendor", 400);
  }

  return prisma.vendorRequest.create({
    data: { userId, ...data },
  });
};

export const findAll = () =>
  prisma.vendorRequest.findMany({
    include: { user: { select: { id: true, userName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

export const findById = async (id: string) => {
  const request = await prisma.vendorRequest.findUnique({
    where: { id },
    include: { user: { select: { id: true, userName: true, email: true } } },
  });
  if (!request) throw new AppError("Vendor request not found", 404);
  return request;
};

export const approveRequest = async (id: string, adminId: string) => {
  const request = await findById(id);

  if (request.status !== "pending")
    throw new AppError("This request has already been reviewed", 400);

  await prisma.vendorRequest.update({
    where: { id },
    data: { status: "approved", reviewedBy: adminId, reviewedAt: new Date() },
  });

  return prisma.user.update({
    where: { id: request.userId },
    data: { role: Role.vendor },
  });
};

export const rejectRequest = async (
  id: string,
  adminId: string,
  rejectionReason: string,
) => {
  const request = await findById(id);

  if (request.status !== "pending")
    throw new AppError("This request has already been reviewed", 400);

  return prisma.vendorRequest.update({
    where: { id },
    data: {
      status: "rejected",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason,
    },
  });
};
