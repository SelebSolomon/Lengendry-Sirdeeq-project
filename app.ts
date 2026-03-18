import express from "express";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import AppError from "./src/utils/app-error.js";
import errorHandler from "./src/middleware/error.middleware.js";
import { Request, Response, NextFunction } from "express";

// routes here lol for my own good
import authRouter from "./src/modules/auth/auth.route.js";
import userRouter from "./src/modules/user/user.route.js";
import vendorRequestRouter from "./src/modules/vendor-request/vendor-request.route.js";
import productRouter from "./src/modules/products/product.route.js";
import categoryRouter from "./src/modules/categories/category.route.js";
import orderRouter from "./src/modules/orders/order.route.js"
import cartRouter from "./src/modules/cart/cart.route.js"

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(express.json({ limit: "10kb" }));

app.get("/", (_req, res) => res.json({ status: "ok" }));

// plug here
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/users", userRouter);
app.use("/api/vendor-requests", vendorRequestRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter)
app.use("/api/carts", cartRouter)

// 404 handler
app.all(/.*/, (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

export default app;
