import express from "express";
import * as paymentController from "./payment.controller.js";

const router = express.Router();

// express.raw() here — we need the raw body to verify Paystack's signature
router.post("/webhook", express.raw({ type: "application/json" }), paymentController.webhook);

export default router;
