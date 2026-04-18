import express from "express";
import upload from "../config/portfolio.multer.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createSkill,
  getAllSkills,
  updateSkill,
  deleteSkill,
} from "../controllers/skill.controller.js";

const router = express.Router();

router.get("/", getAllSkills);
router.post("/", authMiddleware, upload.single("icon"), createSkill);
router.put("/:id", authMiddleware, upload.single("icon"), updateSkill);
router.delete("/:id", authMiddleware, deleteSkill);

export default router;
