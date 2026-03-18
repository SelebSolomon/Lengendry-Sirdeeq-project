import { NextFunction, Response, Request } from "express";
import catchAsync from "../../utils/catch-async.js";
import AppError from "../../utils/app-error.js";
import { response } from "../../utils/response.util.js";
import * as cartService from "./cart.service.js";

export const addToCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    if (!req.body) {
      return next(new AppError("body is empty", 400));
    }
    const { productId, quantity } = req.body;

    const cart = await cartService.addToCart(userId, { productId, quantity });
    if (!cart) return next(new AppError("Product not found", 404));

    response(res, 200, cart);
  },
);

export const getCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cart = await cartService.getCart(req.user!.id);
    if (!cart) return next(new AppError("Cart is empty", 404));

    response(res, 200, cart);
  },
);

export const updateCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const itemId = req.params.itemId as string;
    const { quantity } = req.body;

    const cart = await cartService.updateCart(
      itemId,
      { quantity },
      req.user!.id,
    );
    if (!cart) return next(new AppError("Cart item not found", 404));

    response(res, 200, cart);
  },
);

export const removeItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const itemId = req.params.itemId as string;

    const cart = await cartService.removeItemFromCart(req.user!.id, itemId);
    if (!cart) return next(new AppError("Cart item not found", 404));

    response(res, 200, cart);
  },
);

export const clearCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cart = await cartService.clearCart(req.user!.id);
    if (!cart) return next(new AppError("Cart not found", 404));

    response(res, 200, cart);
  },
);
