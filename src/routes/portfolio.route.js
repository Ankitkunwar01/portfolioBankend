
import express from "express";
import upload from "../config/portfolio.multer.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createPortfolio,
  getAllPortfolio,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
} from "../controllers/portfolio.controller.js";

const router = express.Router();

/* =========================================================
   CREATE PORTFOLIO
   - images: REQUIRED
   - Pdf: OPTIONAL
========================================================= */
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "images", maxCount: 10 }, // REQUIRED (validated in controller)
    { name: "Pdf", maxCount: 5 },     // OPTIONAL
  ]),
  createPortfolio
);

/* =========================================================
   GET ALL PORTFOLIOS
========================================================= */
router.get("/", getAllPortfolio);

/* =========================================================
   GET SINGLE PORTFOLIO
========================================================= */
router.get("/:id", getPortfolioById);

/* =========================================================
   UPDATE PORTFOLIO
========================================================= */
router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    { name: "images", maxCount: 10 }, // add new images
    { name: "Pdf", maxCount: 5 },     // optional
  ]),
  updatePortfolio
);

/* =========================================================
   DELETE PORTFOLIO
========================================================= */
router.delete("/:id", authMiddleware, deletePortfolio);

export default router;
