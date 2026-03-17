import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import AppError from "../utils/app-error.js";
import catchAsync from "../utils/catch-async.js";
import "../types/index.js";

export const checkProductOwnership = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    // Admin can update any product
    if (req.user!.role === "admin") return next();

    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
      select: { vendorId: true },
    });

    if (!product) return next(new AppError("Product not found", 404));

    if (product.vendorId !== req.user!.id) {
      return next(new AppError("You can only update your own products", 403));
    }

    next();
  },
);
