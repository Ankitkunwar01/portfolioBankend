import express from "express";
import mediaRoutes from "../routes/media.route.js";

import portfolioRoute from "../routes/portfolio.route.js";
import contactRoute from "../routes/contact.route.js";
import authRoute from "../routes/auth.route.js";
import authMiddleware from "../middlewares/auth.middleware.js"; // must match folder name
import { createMedia, deleteMedia } from "../controllers/media.controller.js";
import upload from "../middlewares/upload.middleware.js";

import directorRoute from "../routes/Director.route.js";
import team from "../routes/team.route.js"
import skillRoute from "../routes/skill.route.js";
import serviceRoute from "../routes/service.route.js";
import blogRoute from "../routes/blog.route.js";

const router = express.Router();

// Auth routes (public)
router.use("/auth", authRoute);

// Sub-routes
router.use("/media", mediaRoutes);

router.use("/projects", portfolioRoute);
router.use("/contact", contactRoute);

router.use("/team", team);
router.use("/skills", skillRoute);
router.use("/services", serviceRoute);
router.use("/blogs", blogRoute);


// Direct media routes with auth & upload
router.post("/media", authMiddleware, upload.array("images", 10), createMedia);
router.delete("/media/:id", authMiddleware, deleteMedia);





router.use("/directors", directorRoute);

export default router;
