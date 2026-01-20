import express from "express";
import upload from "../config/media.multer.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { uploadLimiter } from "../middlewares/rateLimit.middleware.js";
import {
    createMedia,
    getAllMedia,
    getMediaById,
    updateMedia,
    addImage,              // ← Add this import
    deleteMedia,
    deleteSingleImage,
} from "../controllers/media.controller.js";

const router = express.Router();

// CRUD routes
router.post("/", authMiddleware,  upload.array("images", 10), createMedia);
router.get("/", getAllMedia);
router.get("/:id", getMediaById);
router.put("/:id", authMiddleware,  upload.array("images", 10), updateMedia);
router.delete("/:id", authMiddleware, deleteMedia);

// Image management routes
router.post(
    "/:id/image",                  // POST /api/media/:id/image
    authMiddleware,
    uploadLimiter,                 // Add upload rate limiting
    upload.single("image"),        // Expect a single file with field name "image"
    addImage
);

router.delete(
    "/:mediaId/image/:imageIndex",
    authMiddleware,
    deleteSingleImage
);

export default router;