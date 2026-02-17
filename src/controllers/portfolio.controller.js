import Portfolio from "../models/portfolio.model.js";
import cloudinary from "../utils/cloudinary.js";

/* Helper to upload a file buffer to Cloudinary */
const uploadToCloudinary = (fileBuffer, folder, resource_type = "image") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

/* =========================================================
   CREATE PORTFOLIO
========================================================= */
export const createPortfolio = async (req, res) => {
  try {
    const { title, description, invest } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const investBool = invest === "true" || invest === true;

    // Upload images to Cloudinary
    const images = [];
    if (req.files?.images) {
      for (const file of req.files.images) {
        const url = await uploadToCloudinary(file.buffer, "portfolio/images");
        images.push(url);
      }
    }

    // Upload PDFs to Cloudinary
    const pdfs = [];
    if (req.files?.Pdf) {
      for (const file of req.files.Pdf) {
        const url = await uploadToCloudinary(file.buffer, "portfolio/pdfs", "raw");
        pdfs.push(url);
      }
    }

    if (images.length === 0)
      return res.status(400).json({ message: "At least one image is required" });

    const portfolio = await Portfolio.create({
      title,
      description: description || "",
      images,
      Pdf: pdfs,
      invest: investBool,
    });

    res.status(201).json({ message: "Portfolio created successfully", portfolio });
  } catch (error) {
    console.error("Create portfolio error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =========================================================
   UPDATE PORTFOLIO
========================================================= */
export const updatePortfolio = async (req, res) => {
  try {
    const { title, description, invest, imagesToDelete, pdfsToDelete } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

    let finalImages = [...(portfolio.images || [])];
    let finalPdfs = [...(portfolio.Pdf || [])];

    // Delete images from Cloudinary
    if (imagesToDelete) {
      const toDelete = Array.isArray(imagesToDelete) ? imagesToDelete : JSON.parse(imagesToDelete);
      finalImages = finalImages.filter(img => !toDelete.includes(img));

      for (const imgUrl of toDelete) {
        try {
          const publicId = imgUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`portfolio/images/${publicId}`);
        } catch (err) {
          console.warn("Failed to delete image:", err.message);
        }
      }
    }

    // Upload new images
    if (req.files?.images) {
      for (const file of req.files.images) {
        const url = await uploadToCloudinary(file.buffer, "portfolio/images");
        finalImages.push(url);
      }
    }

    // Delete PDFs from Cloudinary
    if (pdfsToDelete) {
      const toDelete = Array.isArray(pdfsToDelete) ? pdfsToDelete : JSON.parse(pdfsToDelete);
      finalPdfs = finalPdfs.filter(pdf => !toDelete.includes(pdf));

      for (const pdfUrl of toDelete) {
        try {
          const publicId = pdfUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`portfolio/pdfs/${publicId}`, { resource_type: "raw" });
        } catch (err) {
          console.warn("Failed to delete PDF:", err.message);
        }
      }
    }

    // Upload new PDFs
    if (req.files?.Pdf) {
      for (const file of req.files.Pdf) {
        const url = await uploadToCloudinary(file.buffer, "portfolio/pdfs", "raw");
        finalPdfs.push(url);
      }
    }

    if (finalImages.length === 0)
      return res.status(400).json({ message: "At least one image is required" });

    portfolio.title = title;
    portfolio.description = description || portfolio.description;
    portfolio.images = finalImages;
    portfolio.Pdf = finalPdfs;
    if (invest !== undefined) portfolio.invest = invest === "true" || invest === true;

    await portfolio.save();
    res.status(200).json({ message: "Portfolio updated successfully", portfolio });
  } catch (error) {
    console.error("Update portfolio error:", error);
    res.status(500).json({ message: error.message || "Server error during update" });
  }
};

/* =========================================================
   DELETE PORTFOLIO + CLOUDINARY FILES
========================================================= */
export const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findByIdAndDelete(req.params.id);
    if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

    for (const imgUrl of portfolio.images || []) {
      try {
        const publicId = imgUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`portfolio/images/${publicId}`);
      } catch (err) {
        console.warn("Failed to delete image:", err.message);
      }
    }

    for (const pdfUrl of portfolio.Pdf || []) {
      try {
        const publicId = pdfUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`portfolio/pdfs/${publicId}`, { resource_type: "raw" });
      } catch (err) {
        console.warn("Failed to delete PDF:", err.message);
      }
    }

    res.status(200).json({ message: "Portfolio and associated files deleted successfully" });
  } catch (error) {
    console.error("Delete portfolio error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};



/* =========================================================
   GET ALL PORTFOLIOS
========================================================= */
export const getAllPortfolio = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const [total, portfolio] = await Promise.all([
      Portfolio.countDocuments(),
      Portfolio.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
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

    if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

    res.status(200).json(portfolio);
  } catch (error) {
    console.error("Get portfolio by ID error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};