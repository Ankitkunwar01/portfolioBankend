import Media from "../models/media.model.js";
import cloudinary from "../utils/cloudinary.js";

const MAX_IMAGES = 6;

/* =========================================================
   CREATE MEDIA (Upload images to Cloudinary)
========================================================= */
export const createMedia = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Images are required" });
    }

    // Only take up to MAX_IMAGES
    const filesToProcess = req.files.slice(0, MAX_IMAGES);
    const images = [];

    for (const file of filesToProcess) {
      const result = await cloudinary.uploader.upload_stream({
        folder: "media",
        resource_type: "image"
      }, (error, res) => {
        if (error) throw error;
        return res;
      });

      // Since upload_stream requires a buffer, we use promise wrapper
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "media" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      images.push(uploadResult.secure_url);
    }

    const media = new Media({
      images,
      createdBy: req.user.id,
    });

    await media.save();

    res.status(201).json({ success: true, data: media });

  } catch (error) {
    console.error("Create Media Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   GET ALL MEDIA
========================================================= */
export const getAllMedia = async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.status(200).json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   GET SINGLE MEDIA BY ID
========================================================= */
export const getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });
    res.status(200).json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   UPDATE MEDIA (Replace all images)
========================================================= */
export const updateMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Images are required" });
    }

    // Delete old images from Cloudinary
    for (const imgUrl of media.images) {
      const publicId = imgUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`media/${publicId}`);
    }

    // Upload new images
    const filesToProcess = req.files.slice(0, MAX_IMAGES);
    const images = [];

    for (const file of filesToProcess) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "media" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });
      images.push(uploadResult.secure_url);
    }

    media.images = images;
    await media.save();

    res.status(200).json({ message: "Media updated successfully", media });
  } catch (error) {
    console.error("Update Media Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   ADD SINGLE IMAGE (FIFO removal if limit reached)
========================================================= */
export const addImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file uploaded" });

    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    let removedImage = null;

    if (media.images.length >= MAX_IMAGES) {
      removedImage = media.images.shift(); // remove oldest

      // Remove from Cloudinary
      const publicId = removedImage.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`media/${publicId}`);
    }

    // Upload new image
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "media" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    media.images.push(uploadResult.secure_url);
    await media.save();

    res.status(200).json({
      message: "Image added successfully",
      images: media.images,
      removedImage: removedImage || null,
    });

  } catch (error) {
    console.error("Add Image Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   DELETE SINGLE IMAGE
========================================================= */
export const deleteSingleImage = async (req, res) => {
  try {
    const { mediaId, imageIndex } = req.params;

    const media = await Media.findById(mediaId);
    if (!media) return res.status(404).json({ message: "Media not found" });

    const index = parseInt(imageIndex, 10);
    if (isNaN(index) || index < 0 || index >= media.images.length) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    const removedImage = media.images.splice(index, 1)[0];

    // Remove from Cloudinary
    const publicId = removedImage.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`media/${publicId}`);

    if (media.images.length === 0) {
      await Media.findByIdAndDelete(mediaId);
      return res.status(200).json({ message: "Media deleted because no images left" });
    }

    await media.save();
    res.status(200).json({ message: "Image deleted successfully", media });

  } catch (error) {
    console.error("Delete Single Image Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
   DELETE MEDIA
========================================================= */
export const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    // Delete all images from Cloudinary
    for (const imgUrl of media.images) {
      const publicId = imgUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`media/${publicId}`);
    }

    await Media.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Media and all images deleted successfully" });
  } catch (error) {
    console.error("Delete Media Error:", error);
    res.status(500).json({ message: error.message });
  }
};
