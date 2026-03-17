import { Router } from "express";
import * as userController from "./user.controller.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/me", userController.getMe);
router.patch("/me", userController.updateMe);
router.delete("/me", userController.deleteMe);

// Admin only
router.get("/", restrictTo("admin"), userController.getUsers);
router.get("/:id", restrictTo("admin"), userController.getUser);
router.patch("/:id", restrictTo("admin"), userController.updateUser);
router.patch("/:id/suspend", restrictTo("admin"), userController.suspendUser);
router.delete("/:id", restrictTo("admin"), userController.deleteUser);

export default router;
