import express from "express";
import mediaRoutes from "../routes/media.route.js";

import portfolioRoute from "../routes/portfolio.route.js";
import contactRoute from "../routes/contact.route.js";
import authRoute from "../routes/auth.route.js";
import authMiddleware from "../middlewares/auth.middleware.js"; // must match folder name
import { createMedia, deleteMedia } from "../controllers/media.controller.js";
import upload from "../middlewares/upload.middleware.js";

import directorRoute from "../routes/Director.route.js";

const router = express.Router();

// Auth routes (public)
router.use("/auth", authRoute);

// Sub-routes
router.use("/media", mediaRoutes);

router.use("/portfolio", portfolioRoute);
router.use("/contact", contactRoute);

// Direct media routes with auth & upload
router.post("/media", authMiddleware, upload.array("images", 10), createMedia);
router.delete("/media/:id", authMiddleware, deleteMedia);





router.use("/directors", directorRoute);

export default router;
