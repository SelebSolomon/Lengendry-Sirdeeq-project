import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch-async.js";
import * as reviewService from "./review.service.js";
import AppError from "../../utils/app-error.js";
import { response } from "../../utils/response.util.js";

export const postReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const review = await reviewService.postReview(req.user!.id, req.body);
    if (review === "already_reviewed") {
      return next(new AppError("Already reviewed", 400));
    }

    if (review === "product_not_found") {
      return next(new AppError("Product not found", 404));
    }

    response(res, 201, review);
  },
);

export const getAllReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const review = await reviewService.getAllReviews();

    if (review === "No_review") {
      return next(new AppError("NO review yet", 404));
    }

    response(res, 200, review);
  },
);

export const getReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = req.params.id as string;
    const review = await reviewService.getReview(reviewId);
    if (!review) return next(new AppError("Review not found", 404));

    response(res, 200, review);
  },
);

export const deleteReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = req.params.id as string;

    const review = await reviewService.deleteReview(req.user!.id, reviewId);

    if (review === "not_allowed") {
      return next(
        new AppError("You don't have permission to delete this review", 403),
      );
    }

    if (review === "review_not_found") {
      return next(new AppError("Review not found", 404));
    }

    response(res, 204, review);
  },
);
