import express from "express";
import upload from "../middlewares/director.upload.js";
import {
  createDirector,
  getAllDirectors,
  getDirectorById,
  updateDirector,
  deleteDirector,
  reorderDirectors,

} from "../controllers/Director.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post("/", upload.single("image"), authMiddleware, createDirector);

router.get("/", getAllDirectors);
router.get("/:id", getDirectorById);

//  reorder must come BEFORE :id
router.put("/reorder", authMiddleware, reorderDirectors);

router.put("/:id", upload.single("image"), authMiddleware, updateDirector);

router.delete("/:id", authMiddleware, deleteDirector);


export default router;