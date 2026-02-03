import Director from "../models/Director.model.js";
import fs from "fs";
import path from "path";

/* =========================================================
   CREATE DIRECTOR
   - Image: REQUIRED
========================================================= */
export const createDirector = async (req, res) => {
  try {
    const {
      name,
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

    const imagePath = `/uploads/Director/${req.file.filename}`;

    const director = await Director.create({
      name,
      title,
      image: imagePath,
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
        .sort({ createdAt: -1 })
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
      if (director.image) {
        // remove leading slash and create absolute path
        const oldImagePath = path.join(
          process.cwd(),
          director.image.replace(/^\/+/, "")
        );

        // delete only if file exists
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // set new image
      director.image = `/uploads/Director/${req.file.filename}`;
    }

    // ── Apply updates ────────────────────────────────────────
    director.name = name ?? director.name;
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

    const imagePath = path.join(
      process.cwd(),
      director.image.replace(/^\/+/, "")
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(200).json({
      message: "Director deleted successfully",
    });
  } catch (error) {
    console.error("Delete director error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};