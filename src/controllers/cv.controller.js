import CV from "../models/cv.model.js";
import cloudinary from "../utils/cloudinary.js";

export const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No CV file uploaded" });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          folder: "cv",
          resource_type: "image", 
          type: "upload" // Explicitly set to public upload
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const newCV = new CV({
      title,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      createdBy: req.user.id,
    });

    await newCV.save();
    res.status(201).json(newCV);
  } catch (error) {
    console.error("Upload CV Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getLatestCV = async (req, res) => {
  try {
    const cv = await CV.findOne().sort({ createdAt: -1 });
    if (!cv) return res.status(200).json(null);
    res.status(200).json(cv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCVs = async (req, res) => {
  try {
    const cvs = await CV.find().sort({ createdAt: -1 });
    res.status(200).json(cvs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCV = async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) return res.status(404).json({ message: "CV not found" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(cv.publicId);

    await CV.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "CV deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
