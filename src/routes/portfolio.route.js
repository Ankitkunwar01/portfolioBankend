// import express from "express";
// import upload from "../config/portfolio.multer.js";
// import authMiddleware from "../middlewares/auth.middleware.js";
// import { uploadLimiter } from "../middlewares/rateLimit.middleware.js";
// import {
//     createPortfolio,
//     getAllPortfolio,
//     getPortfolioById,
//     updatePortfolio,
//     deletePortfolio,
// } from "../controllers/portfolio.controller.js";

// const router = express.Router();

// // Create a new portfolio document
// router.post("/", authMiddleware,  upload.array("images", 10), createPortfolio);

// // Get all portfolio documents
// router.get("/", getAllPortfolio);
// // Get a single portfolio by ID
// router.get("/:id", getPortfolioById);

// // Update a portfolio document by ID
// router.put("/:id", authMiddleware,  upload.array("images", 10), updatePortfolio);

// // Delete a portfolio document by ID
// router.delete("/:id", authMiddleware, deletePortfolio);

// export default router;
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
    { name: "images", maxCount: 1 }, // add new images
    { name: "Pdf", maxCount: 2 },     // optional
  ]),
  updatePortfolio
);

/* =========================================================
   DELETE PORTFOLIO
========================================================= */
router.delete("/:id", authMiddleware, deletePortfolio);

export default router;
