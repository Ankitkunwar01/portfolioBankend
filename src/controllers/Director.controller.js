

import Director from "../models/Director.model.js";
import cloudinary from "../utils/cloudinary.js";

/* =========================================================
   CREATE DIRECTOR
   - Image: REQUIRED
========================================================= */
export const createDirector = async (req, res) => {
  try {
    const {
      name,
      alternativeName,
      title,
      description,
      education,
      experience,
      specialization,
      roles,
      investments,
      community,
      skills,
      socials,
      portfolio,
    } = req.body;

    if (!name || !title || !description) {
      return res.status(400).json({ message: "Name, title and description are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Director image is required" });
    }

    // ── Upload image to Cloudinary ─────────────────────────
    const streamUpload = (fileBuffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Director" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(fileBuffer);
      });

    const result = await streamUpload(req.file.buffer);

    const director = await Director.create({
      name,
      alternativeName,
      title,
      image: result.secure_url,
      description,
      education,
      experience,
      specialization,
      roles: roles ? JSON.parse(roles) : [],
      investments: investments ? JSON.parse(investments) : [],
      community: community ? JSON.parse(community) : [],
      skills: skills ? JSON.parse(skills) : [],
      socials: socials ? JSON.parse(socials) : {},
      portfolio: portfolio || "",
    });

    res.status(201).json({
      message: "Director created successfully",
      director,
    });
  } catch (error) {
    console.error("Create director error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =========================================================
   GET ALL DIRECTORS (WITH PAGINATION)
========================================================= */
export const getAllDirectors = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const [total, directors] = await Promise.all([
      Director.countDocuments(),
      Director.find()
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      directors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get directors error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =========================================================
   GET SINGLE DIRECTOR BY ID
========================================================= */
export const getDirectorById = async (req, res) => {
  try {
    const director = await Director.findById(req.params.id);

    if (!director) {
      return res.status(404).json({ message: "Director not found" });
    }

    res.status(200).json(director);
  } catch (error) {
    console.error("Get director by ID error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =========================================================
   UPDATE DIRECTOR
========================================================= */
export const updateDirector = async (req, res) => {
  try {
    const director = await Director.findById(req.params.id);

    if (!director) {
      return res.status(404).json({ message: "Director not found" });
    }

    const {
      name,
      alternativeName,
      title,
      description,
      education,
      experience,
      specialization,
      roles,
      investments,
      community,
      skills,
      socials,
      portfolio,
    } = req.body;

    // ── Image update ────────────────────────────────────────
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (director.image) {
        const publicId = director.image
          .split("/")
          .slice(-1)[0]
          .split(".")[0]; // get filename without extension

        try {
          await cloudinary.uploader.destroy(`Director/${publicId}`);
        } catch (err) {
          console.warn("Old image not deleted:", err.message);
        }
      }

      const streamUpload = (fileBuffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "Director" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(fileBuffer);
        });

      const result = await streamUpload(req.file.buffer);
      director.image = result.secure_url;
    }

    // ── Apply updates ────────────────────────────────────────
    director.name = name ?? director.name;
    director.alternativeName = alternativeName ?? director.alternativeName;
    director.title = title ?? director.title;
    director.description = description ?? director.description;
    director.education = education ?? director.education;
    director.experience = experience ?? director.experience;
    director.specialization = specialization ?? director.specialization;
    director.roles = roles ? JSON.parse(roles) : director.roles;
    director.investments = investments ? JSON.parse(investments) : director.investments;
    director.community = community ? JSON.parse(community) : director.community;
    director.skills = skills ? JSON.parse(skills) : director.skills;
    director.socials = socials ? JSON.parse(socials) : director.socials;
    director.portfolio = portfolio ?? director.portfolio;

    await director.save();

    res.status(200).json({
      message: "Director updated successfully",
      director,
    });
  } catch (error) {
    console.error("Update director error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =========================================================
   DELETE DIRECTOR + IMAGE
========================================================= */
export const deleteDirector = async (req, res) => {
  try {
    const director = await Director.findByIdAndDelete(req.params.id);

    if (!director) {
      return res.status(404).json({ message: "Director not found" });
    }

    if (director.image) {
      const publicId = director.image
        .split("/")
        .slice(-1)[0]
        .split(".")[0]; // get filename without extension

      try {
        await cloudinary.uploader.destroy(`Director/${publicId}`);
      } catch (err) {
        console.warn("Image not deleted:", err.message);
      }
    }

    res.status(200).json({
      message: "Director deleted successfully",
    });
  } catch (error) {
    console.error("Delete director error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =========================================================
   REORDER DIRECTORS
========================================================= */
export const reorderDirectors = async (req, res) => {
  try {
    const { directors } = req.body; // [{ _id, order }]
    if (!directors || !Array.isArray(directors)) {
      return res.status(400).json({ message: "Invalid directors array" });
    }

    const bulkOps = directors.map(d => ({
      updateOne: {
        filter: { _id: d._id },
        update: { order: d.order },
      }
    }));

    if (bulkOps.length > 0) {
      await Director.bulkWrite(bulkOps);
    }

    res.status(200).json({ message: "Directors reordered successfully" });
  } catch (error) {
    console.error("Reorder directors error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
