import express from "express";
import * as authcontroller from "./auth.controller.js";

const router = express.Router();

router.route("/register").post(authcontroller.register);
router.route("/login").post(authcontroller.login);
router.route("/forgot-password").post(authcontroller.forgotPassword);
router.route("/reset-password/:token").patch(authcontroller.resetPassword);
router.route("/update-password").patch(authcontroller.updatePassword);

export default router;
