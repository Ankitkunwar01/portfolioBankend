import express from "express";
import upload from "../middlewares/team.upload.js";
import {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/team.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =============================
   CREATE
============================= */
router.post(
  "/",
  upload.single("image"),
  authMiddleware,
  createTeamMember
);

/* =============================
   READ
============================= */
router.get("/", getAllTeamMembers);      // GET all team members (pagination)
router.get("/:id", getTeamMemberById);   // GET single team member by ID

/* =============================
   UPDATE
============================= */
router.put(
  "/:id",
  upload.single("image"),
  authMiddleware,
  updateTeamMember
);

/* =============================
   DELETE
============================= */
router.delete(
  "/:id",
  authMiddleware,
  deleteTeamMember
);

export default router;