import express from "express";
import * as authMiddleware from "../../middleware/auth.middleware.js";
import * as reviewController from "./review.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { reviewSchema } from "../../validators/review.validator.js";
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authMiddleware.protect,
    validate(reviewSchema),
    reviewController.postReview,
  );

router
  .route("/:id")
  .get(reviewController.getReview)
//   .patch(
//     authMiddleware.protect,
//     authMiddleware.restrictTo( "admin"),
//     reviewController.updateReview,
//   )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo("user", "admin", "vendor"),
    reviewController.deleteReview,
  );

export default router;
