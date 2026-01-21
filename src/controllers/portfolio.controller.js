
import Portfolio from "../models/portfolio.model.js";
import fs from "fs";
import path from "path";

/* =========================================================
   CREATE PORTFOLIO
   - Image: REQUIRED
   - PDF: OPTIONAL
   - invest: optional boolean (from string or boolean)
========================================================= */
export const createPortfolio = async (req, res) => {
  try {
    const { title, description, invest } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const investBool = invest === "true" || invest === true;

    const images = req.files?.images?.map(file => `/uploads/portfolio/${file.filename}`) || [];
    const pdfs   = req.files?.Pdf?.map(file => `/uploads/pdfs/${file.filename}`) || [];

    // if (images.length === 0) {
    //   return res.status(400).json({ message: "At least one image is required" });
    // }

    const portfolio = await Portfolio.create({
      title,
      description: description || "",
      images,
      Pdf: pdfs,
      invest: investBool,
    });

    res.status(201).json({
      message: "Portfolio created successfully",
      portfolio,
    });
  } catch (error) {
    console.error("Create portfolio error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =========================================================
   GET ALL PORTFOLIOS (WITH PAGINATION)
========================================================= */
export const getAllPortfolio = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const [total, portfolio] = await Promise.all([
      Portfolio.countDocuments(),
      Portfolio.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      portfolio,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get all portfolios error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =========================================================
   GET SINGLE PORTFOLIO BY ID
========================================================= */
export const getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.status(200).json(portfolio);
  } catch (error) {
    console.error("Get portfolio by ID error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =========================================================
   UPDATE PORTFOLIO
   - Supports: title, description, invest
   - Image deletion + new images
   - PDF deletion + new PDFs
   - At least one image required
========================================================= */
export const updatePortfolio = async (req, res) => {
  try {
    const { title, description, invest } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    let finalImages = [...(portfolio.images || [])];
    let finalPdfs   = [...(portfolio.Pdf || [])];

    // ── Images deletion ────────────────────────────────────────
    if (req.body.imagesToDelete) {
      let toDelete = [];
      try {
        toDelete = Array.isArray(req.body.imagesToDelete)
          ? req.body.imagesToDelete
          : JSON.parse(req.body.imagesToDelete);
      } catch {
        toDelete = [req.body.imagesToDelete];
      }

      finalImages = finalImages.filter(img => !toDelete.includes(img));

      // Delete files from disk
      toDelete.forEach(imgPath => {
        const filePath = path.join(process.cwd(), imgPath.replace(/^\/+/, ""));
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.warn(`Failed to delete image: ${filePath}`, err.message);
          }
        }
      });
    }

    // ── Add new images ─────────────────────────────────────────
    if (req.files?.images?.length) {
      const newPaths = req.files.images.map(f => `/uploads/portfolio/${f.filename}`);
      finalImages.push(...newPaths);
    }

    if (finalImages.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // ── PDFs deletion ──────────────────────────────────────────
    if (req.body.pdfsToDelete) {
      let toDelete = [];
      try {
        toDelete = Array.isArray(req.body.pdfsToDelete)
          ? req.body.pdfsToDelete
          : JSON.parse(req.body.pdfsToDelete);
      } catch {
        toDelete = [req.body.pdfsToDelete];
      }

      finalPdfs = finalPdfs.filter(pdf => !toDelete.includes(pdf));

      // Delete files from disk
      toDelete.forEach(pdfPath => {
        const filePath = path.join(process.cwd(), pdfPath.replace(/^\/+/, ""));
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.warn(`Failed to delete PDF: ${filePath}`, err.message);
          }
        }
      });
    }

    // ── Add new PDFs ───────────────────────────────────────────
    if (req.files?.Pdf?.length) {
      const newPaths = req.files.Pdf.map(f => `/uploads/pdfs/${f.filename}`);
      finalPdfs.push(...newPaths);
    }

    // ── Apply updates ──────────────────────────────────────────
    portfolio.title       = title;
    portfolio.description = description || portfolio.description;
    portfolio.images      = finalImages;
    portfolio.Pdf         = finalPdfs;

    if (invest !== undefined) {
      portfolio.invest = invest === "true" || invest === true;
    }

    await portfolio.save();

    res.status(200).json({
      message: "Portfolio updated successfully",
      portfolio,
    });
  } catch (error) {
    console.error("Update portfolio error:", error);
    res.status(500).json({ message: error.message || "Server error during update" });
  }
};

/* =========================================================
   DELETE PORTFOLIO + ASSOCIATED FILES
========================================================= */
export const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findByIdAndDelete(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    const files = [
      ...(portfolio.images || []),
      ...(portfolio.Pdf || []),
    ];

    files.forEach(filePath => {
      const fullPath = path.join(process.cwd(), filePath.replace(/^\/+/, ""));
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.warn(`Failed to delete file: ${fullPath}`, err.message);
        }
      }
    });

    res.status(200).json({
      message: "Portfolio and associated files deleted successfully",
    });
  } catch (error) {
    console.error("Delete portfolio error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};