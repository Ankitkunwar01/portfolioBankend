import express from "express";
import {
    createMessage,
    getAllMessages,
    getMessageById,
    updateMessage,
    deleteMessage,
    getUnreadCount,
    markAsRead,
} from "../controllers/contact.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { userLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Create a new message - rate limited to prevent spam
router.post("/", userLimiter,createMessage);

// Get all messages
router.get("/", authMiddleware, getAllMessages);

// Get unread messages count (must be before /:id route)
router.get("/count/unread", authMiddleware, getUnreadCount);

// Get a single message by ID
router.get("/:id", authMiddleware, getMessageById);

// Update a message by ID
router.put("/:id", authMiddleware, updateMessage);

// Mark message as read
router.patch("/:id/read", authMiddleware, markAsRead);

// Delete a message by ID
router.delete("/:id", authMiddleware, deleteMessage);

export default router;
