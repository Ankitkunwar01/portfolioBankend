import express from "express";
import upload from "../middlewares/director.upload.js";
import {
  createDirector,
  getAllDirectors,
  getDirectorById,
  updateDirector,
  deleteDirector,
} from "../controllers/Director.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";


const router = express.Router();

/* =============================
   CREATE
============================= */
router.post("/", upload.single("image"),authMiddleware, createDirector);

/* =============================
   READ
============================= */
router.get("/", getAllDirectors);        // GET all directors (pagination)
router.get("/:id", getDirectorById);     // GET single director by ID

/* =============================
   UPDATE
============================= */
router.put("/:id", upload.single("image"),authMiddleware, updateDirector);

/* =============================
   DELETE
============================= */
router.delete("/:id", authMiddleware,deleteDirector);

export default router;