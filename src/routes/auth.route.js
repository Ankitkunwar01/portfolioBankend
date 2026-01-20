import express from "express";
import { loginAdmin, verifyToken, createAdmin } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { loginLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Public routes
router.post("/login",  loginAdmin);
router.post("/create-admin", createAdmin); // For initial setup only

// Protected routes
router.get("/verify", authMiddleware, verifyToken);

export default router;
