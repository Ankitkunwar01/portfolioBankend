import Media from "../models/media.model.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MAX_IMAGES = 6;

// Create a new media document with initial images (up to 6)
export const createMedia = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Unauthorized: User not found in token",
            });
        }

        let images = [];

        if (req.files && req.files.length > 0) {
            // Only take up to MAX_IMAGES (6) from the uploaded files
            const filesToProcess = req.files.slice(0, MAX_IMAGES);
            images = filesToProcess.map(
                file => `/uploads/media/${file.filename}`
            );
        } else if (req.body.images) {
            const imageArray = Array.isArray(req.body.images)
                ? req.body.images
                : [req.body.images];
            // Only take up to MAX_IMAGES (6) from the provided images
            images = imageArray.slice(0, MAX_IMAGES);
        }

        if (!images.length) {
            return res.status(400).json({ message: "Images are required" });
        }

        const media = new Media({
            images,
            createdBy: req.user.id,
        });

        await media.save();

        res.status(201).json({
            success: true,
            data: media,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all media
export const getAllMedia = async (req, res) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 });
        res.status(200).json(media);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single media by ID
export const getMediaById = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: "Media not found" });
        }
        res.status(200).json(media);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update media by ID (replace all images, up to MAX_IMAGES)
export const updateMedia = async (req, res) => {
    try {
        let images = [];
        
        if (req.files && req.files.length > 0) {
            // Only take up to MAX_IMAGES (6) from the uploaded files
            const filesToProcess = req.files.slice(0, MAX_IMAGES);
            images = filesToProcess.map(file => `/uploads/media/${file.filename}`);
        } else if (req.body.images) {
            const imageArray = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
            // Only take up to MAX_IMAGES (6) from the provided images
            images = imageArray.slice(0, MAX_IMAGES);
        }

        if (!images || images.length === 0) {
            return res.status(400).json({ message: "Images are required" });
        }

        const media = await Media.findByIdAndUpdate(
            req.params.id,
            { images },
            { new: true }
        );
        if (!media) {
            return res.status(404).json({ message: "Media not found" });
        }
        res.status(200).json(media);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a single new image to existing media (with max limit and FIFO removal)
export const addImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded" });
        }

        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: "Media not found" });
        }

        const newImagePath = `/uploads/media/${req.file.filename}`; // consistent with createMedia

        let removedImage = null;

        // If limit reached, remove the oldest (first) image
        if (media.images.length >= MAX_IMAGES) {
            removedImage = media.images.shift();

            // Delete the old file from disk
            try {
                const fullPath = path.isAbsolute(removedImage)
                    ? removedImage
                    : path.join(__dirname, '..', '..', removedImage);

                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            } catch (fileError) {
                console.error('Error deleting old image file:', fileError.message);
                // Continue — we still want to add the new image
            }
        }

        // Add the new image
        media.images.push(newImagePath);
        await media.save();

        res.json({
            message: "Image added successfully",
            images: media.images,
            removedImage: removedImage || null, // optional: inform client if something was removed
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete media by ID
// export const deleteMedia = async (req, res) => {
//     try {
//         const media = await Media.findByIdAndDelete(req.params.id);
//         if (!media) {
//             return res.status(404).json({ message: "Media not found" });
//         }
        
//         // Delete all physical files
//         for (const imagePath of media.images) {
//             try {
//                 const fullPath = path.isAbsolute(imagePath)
//                     ? imagePath
//                     : path.join(__dirname, '..', '..', imagePath);
                
//                 if (fs.existsSync(fullPath)) {
//                     fs.unlinkSync(fullPath);
//                 }
//             } catch (fileError) {
//                 console.error('Error deleting file:', fileError.message);
//             }
//         }
        
//         res.status(200).json({ message: "Media deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Delete a single image from a media document
// export const deleteSingleImage = async (req, res) => {
//     try {
//         const { mediaId, imageIndex } = req.params;
        
//         const media = await Media.findById(mediaId);
//         if (!media) {
//             return res.status(404).json({ message: "Media not found" });
//         }
        
//         const index = parseInt(imageIndex, 10);
//         if (isNaN(index) || index < 0 || index >= media.images.length) {
//             return res.status(400).json({ message: "Invalid image index" });
//         }
        
//         const imagePath = media.images[index];
        
//         // Remove from array
//         media.images.splice(index, 1);
        
//         // If no images left, delete the document
//         if (media.images.length === 0) {
//             const fullPath = path.isAbsolute(imagePath)
//                 ? imagePath
//                 : path.join(__dirname, '..', '..', imagePath);
                
//             if (fs.existsSync(fullPath)) {
//                 fs.unlinkSync(fullPath);
//             }
            
//             await Media.findByIdAndDelete(mediaId);
//             return res.status(200).json({ message: "Media document deleted as it had no images left" });
//         }
        
//         await media.save();
        
//         // Delete physical file
//         try {
//             const fullPath = path.isAbsolute(imagePath)
//                 ? imagePath
//                 : path.join(__dirname, '..', '..', imagePath);
                
//             if (fs.existsSync(fullPath)) {
//                 fs.unlinkSync(fullPath);
//             }
//         } catch (fileError) {
//             console.error('Error deleting file:', fileError.message);
//         }
        
//         res.status(200).json({ message: "Image deleted successfully", media });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
export const deleteMedia = async (req, res) => {
    try {
        const media = await Media.findByIdAndDelete(req.params.id);

        if (!media) {
            return res.status(404).json({ message: "Media not found" });
        }

        const mediaFolderPath = path.join(__dirname, "..", "..", "uploads", "media");

        // 1️⃣ Delete all image files
        for (let imagePath of media.images) {
            try {
                // 🔥 FIX: remove leading slash
                imagePath = imagePath.replace(/^\/+/, "");

                const fullPath = path.join(__dirname, "..", "..", imagePath);

                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            } catch (err) {
                console.error("Error deleting image:", err.message);
            }
        }

        // 2️⃣ Delete uploads/media folder IF EMPTY
        if (
            fs.existsSync(mediaFolderPath) &&
            fs.readdirSync(mediaFolderPath).length === 0
        ) {
            fs.rmdirSync(mediaFolderPath);
        }

        res.status(200).json({
            message: "Media, images, and folder deleted successfully",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteSingleImage = async (req, res) => {
    try {
        const { mediaId, imageIndex } = req.params;

        const media = await Media.findById(mediaId);
        if (!media) {
            return res.status(404).json({ message: "Media not found" });
        }

        const index = parseInt(imageIndex, 10);
        if (isNaN(index) || index < 0 || index >= media.images.length) {
            return res.status(400).json({ message: "Invalid image index" });
        }

        const imagePath = media.images[index];

        // 🔥 FIX
        const cleanedPath = imagePath.replace(/^\/+/, "");
        const fullPath = path.join(__dirname, "..", "..", cleanedPath);

        // Remove image from DB
        media.images.splice(index, 1);

        // If no images left → delete document
        if (media.images.length === 0) {
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
            await Media.findByIdAndDelete(mediaId);
            return res.status(200).json({
                message: "Media deleted because it had no images left",
            });
        }

        await media.save();

        // Delete physical file
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        res.status(200).json({
            message: "Image deleted successfully",
            media,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


