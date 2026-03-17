import { Router } from "express";
import * as vendorRequestController from "./vendor-request.controller.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

// User submits a vendor request
router.post("/", restrictTo("user"), vendorRequestController.submitRequest);

// admin routes
router.get("/", restrictTo("admin"), vendorRequestController.getAllRequests);
router.patch("/:id/approve", restrictTo("admin"), vendorRequestController.approveRequest);
router.patch("/:id/reject", restrictTo("admin"), vendorRequestController.rejectRequest);

export default router;
