import express from "express";
import upload from "../config/cv.multer.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { uploadCV, getAllCVs, deleteCV, getLatestCV } from "../controllers/cv.controller.js";

const router = express.Router();

router.get("/", getLatestCV);
router.get("/all", getAllCVs);
router.post("/", authMiddleware, upload.single("cv"), uploadCV);
router.delete("/:id", authMiddleware, deleteCV);

export default router;
