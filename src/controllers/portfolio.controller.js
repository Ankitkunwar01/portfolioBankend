// import Portfolio from "../models/portfolio.model.js";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// // Create a new portfolio document (with optional title)
// export const createPortfolio = async (req, res) => {
//     try {
//         const { title, description } = req.body;
        
//         if (!title) {
//             return res.status(400).json({ message: "Title is required" });
//         }
        
//         // Check if files were uploaded via multer
//         let images = [];
        
//         if (req.files && req.files.length > 0) {
//             // Files uploaded - store file paths
//             images = req.files.map(file => `/uploads/portfolio/${file.filename}`);
//         } else if (req.body.images) {
//             // URLs provided in body
//             images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
//         }
        
//         if (!images || images.length === 0) {
//             return res.status(400).json({ message: "Images are required" });
//         }

//         const portfolio = new Portfolio({ title, description, images });
//         await portfolio.save();
//         res.status(201).json(portfolio);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Get all portfolio documents with pagination
// export const getAllPortfolio = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;
        
//         const totalPortfolio = await Portfolio.countDocuments();
//         const portfolio = await Portfolio.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        
//         res.status(200).json({
//             portfolio,
//             pagination: {
//                 currentPage: page,
//                 totalPages: Math.ceil(totalPortfolio / limit),
//                 totalPortfolio,
//                 hasNextPage: page < Math.ceil(totalPortfolio / limit),
//                 hasPrevPage: page > 1
//             }
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Get a single portfolio by ID
// export const getPortfolioById = async (req, res) => {
//     try {
//         const portfolio = await Portfolio.findById(req.params.id);
//         if (!portfolio) {
//             return res.status(404).json({ message: "Portfolio not found" });
//         }
//         res.status(200).json(portfolio);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Update portfolio by ID
// export const updatePortfolio = async (req, res) => {
//     try {
//         const { title, description } = req.body;
        
//         if (!title) {
//             return res.status(400).json({ message: "Title is required" });
//         }
        
//         // Get existing portfolio document to work with current images
//         const existingPortfolio = await Portfolio.findById(req.params.id);
//         if (!existingPortfolio) {
//             return res.status(404).json({ message: "Portfolio not found" });
//         }
        
//         // Start with existing images
//         let finalImages = [...existingPortfolio.images];
        
//         // Handle images to delete
//         // Since FormData can send multiple values with the same key, 
//         // we need to handle both string and array cases
//         let imagesToDelete = [];
//         if (req.body.imagesToDelete) {
//             // Check if it's a JSON string
//             if (typeof req.body.imagesToDelete === 'string') {
//                 try {
//                     imagesToDelete = JSON.parse(req.body.imagesToDelete);
//                 } catch (e) {
//                     // If parsing fails, treat as single value
//                     imagesToDelete = [req.body.imagesToDelete];
//                 }
//             } else if (Array.isArray(req.body.imagesToDelete)) {
//                 imagesToDelete = req.body.imagesToDelete;
//             } else {
//                 // Single value
//                 imagesToDelete = [req.body.imagesToDelete];
//             }
                
//             // Remove deleted images from the array
//             finalImages = finalImages.filter(image => !imagesToDelete.includes(image));
//         }
        
//         // Handle new images uploaded via multer
//         if (req.files && req.files.length > 0) {
//             // Add new uploaded images
//             const newImages = req.files.map(file => `/uploads/portfolio/${file.filename}`);
//             finalImages = [...finalImages, ...newImages];
//         } 
//         // Handle images provided in body (for backward compatibility)
//         else if (req.body.images) {
//             const newImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
//             finalImages = [...finalImages, ...newImages];
//         }
        
//         // Validate that we still have images
//         if (finalImages.length === 0) {
//             return res.status(400).json({ message: "At least one image is required" });
//         }
        
//         // Update the document
//         const portfolio = await Portfolio.findByIdAndUpdate(
//             req.params.id,
//             { title, description, images: finalImages },
//             { new: true }
//         );

//         res.status(200).json(portfolio);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Delete portfolio by ID
// // export const deletePortfolio = async (req, res) => {
// //     try {
// //         const portfolio = await Portfolio.findByIdAndDelete(req.params.id);
// //         if (!portfolio) {
// //             return res.status(404).json({ message: "Portfolio not found" });
// //         }
// //         res.status(200).json({ message: "Portfolio deleted successfully" });
// //     } catch (error) {
// //         res.status(500).json({ message: error.message });
// //     }
// // };
// export const deletePortfolio = async (req, res) => {
//     try {
//         const portfolio = await Portfolio.findByIdAndDelete(req.params.id);
//         if (!portfolio) {
//             return res.status(404).json({ message: "Portfolio not found" });
//         }

//         // Delete all images associated with this portfolio
//         if (Array.isArray(portfolio.images)) {
//             for (let imagePath of portfolio.images) {
//                 try {
//                     // Remove any leading slash
//                     imagePath = imagePath.replace(/^\/+/, "");
//                     const fullPath = path.join(process.cwd(), imagePath);

//                     if (fs.existsSync(fullPath)) {
//                         fs.unlinkSync(fullPath);
//                         console.log("Deleted file:", fullPath);
//                     }
//                 } catch (err) {
//                     console.error("Error deleting portfolio image:", err.message);
//                 }
//             }
//         }

//         // Optional: delete portfolio folder if you used per-portfolio folders
//         // const portfolioFolderPath = path.join(process.cwd(), "uploads", "portfolio", portfolio._id.toString());
//         // if (fs.existsSync(portfolioFolderPath) && fs.readdirSync(portfolioFolderPath).length === 0) {
//         //     fs.rmdirSync(portfolioFolderPath);
//         // }

//         res.status(200).json({ message: "Portfolio and images deleted successfully" });

//     } catch (error) {
//         console.error("Error deleting portfolio:", error);
//         res.status(500).json({ message: "Failed to delete portfolio release" });
//     }
// };
import Portfolio from "../models/portfolio.model.js";
import fs from "fs";
import path from "path";

/* =========================================================
   CREATE PORTFOLIO
   - Image: REQUIRED
   - PDF: OPTIONAL (future ready)
========================================================= */
export const createPortfolio = async (req, res) => {
  try {
    const { title, description, invest } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Convert invest string to boolean
    const investBool = invest === "true" || invest === true;

    const images =
      req.files?.images?.map(file => `/uploads/portfolio/${file.filename}`) || [];

    const Pdf =
      req.files?.Pdf?.map(file => `/uploads/pdfs/${file.filename}`) || [];

    if (images.length === 0) {
      return res.status(400).json({
        message: "At least one image is required",
      });
    }

    const portfolio = await Portfolio.create({
      title,
      description,
      images,
      Pdf,
      invest: investBool,
    });

    res.status(201).json({
      message: "Portfolio created successfully",
      portfolio,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =========================================================
   GET ALL PORTFOLIOS (PAGINATION)
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
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   GET PORTFOLIO BY ID
========================================================= */
export const getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   UPDATE PORTFOLIO
   - Keep old images
   - Delete selected images
   - Add new images
========================================================= */
export const updatePortfolio = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    let finalImages = [...portfolio.images];

    /* ---------- DELETE IMAGES ---------- */
    if (req.body.imagesToDelete) {
      let imagesToDelete = [];

      try {
        imagesToDelete = Array.isArray(req.body.imagesToDelete)
          ? req.body.imagesToDelete
          : JSON.parse(req.body.imagesToDelete);
      } catch {
        imagesToDelete = [req.body.imagesToDelete];
      }

      finalImages = finalImages.filter(
        img => !imagesToDelete.includes(img)
      );

      // Remove files from disk
      imagesToDelete.forEach(img => {
        const filePath = path.join(process.cwd(), img.replace(/^\/+/, ""));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    /* ---------- ADD NEW IMAGES ---------- */
    if (req.files?.images?.length) {
      const newImages = req.files.images.map(
        file => `/uploads/portfolio/${file.filename}`
      );
      finalImages.push(...newImages);
    }

    if (finalImages.length === 0) {
      return res.status(400).json({
        message: "At least one image is required",
      });
    }

    portfolio.title = title;
    portfolio.description = description;
    portfolio.images = finalImages;

    await portfolio.save();

    res.status(200).json({
      message: "Portfolio updated successfully",
      portfolio,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   DELETE PORTFOLIO + FILES
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

    files.forEach(file => {
      const filePath = path.join(process.cwd(), file.replace(/^\/+/, ""));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    res.status(200).json({
      message: "Portfolio and files deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
