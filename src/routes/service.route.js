import express from "express";
import upload from "../config/portfolio.multer.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

const router = express.Router();

router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.post("/", authMiddleware, upload.single("icon"), createService);
router.put("/:id", authMiddleware, upload.single("icon"), updateService);
router.delete("/:id", authMiddleware, deleteService);

export default router;
