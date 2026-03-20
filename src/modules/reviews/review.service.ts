import { prisma } from "../../lib/prisma.js";
import { CreateReviewDto } from "./dto/review.dto.js";
import { reviewResponse } from "./response/review-response.js";

export const postReview = async (userId: string, dto: CreateReviewDto) => {
  const productExist = await prisma.product.findUnique({
    where: { id: dto.productId },
  });

  if (!productExist) {
    return "product_not_found";
  }

  const reviewExist = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId: dto.productId } },
  });

  if (reviewExist) {
    return "already_reviewed";
  }

  const review = await prisma.review.create({
    data: { ...dto, userId },
    select: reviewResponse,
  });

  return review;
};

export const getAllReviews = async () => {
  const reviews = await prisma.review.findMany({ select: reviewResponse });

  if (reviews.length === 0) {
    return "No_review";
  }

  return reviews;
};

export const getReview = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: reviewResponse,
  });
  return review;
};

export const deleteReview = async (userId: string, reviewId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true },
  });

  if (!review) {
    return "review_not_found";
  }

  const isAdmin = user?.role === "admin";
  const isOwner = review.userId === userId;

  if (!isAdmin && !isOwner) {
    return "not_allowed";
  }

  const deletedReview = await prisma.review.delete({
    where: { id: reviewId },
    select: reviewResponse,
  });
  return deletedReview;
};
