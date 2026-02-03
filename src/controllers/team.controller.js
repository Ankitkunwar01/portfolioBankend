import Team from "../models/team.model.js";
import fs from "fs";
import path from "path";

/* =========================================================
   CREATE TEAM MEMBER
   - Image: REQUIRED
========================================================= */
export const createTeamMember = async (req, res) => {
  try {
    const { name, role, socialMedia } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        message: "Name and role are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Team member image is required",
      });
    }

    const imagePath = `/uploads/team/${req.file.filename}`;

    const teamMember = await Team.create({
      name,
      role,
      image: imagePath,
      socialMedia: socialMedia ? JSON.parse(socialMedia) : [],
    });

    res.status(201).json({
      message: "Team member created successfully",
      teamMember,
    });
  } catch (error) {
    console.error("Create team member error:", error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

/* =========================================================
   GET ALL TEAM MEMBERS (WITH PAGINATION)
========================================================= */
export const getAllTeamMembers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const [total, teamMembers] = await Promise.all([
      Team.countDocuments(),
      Team.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      teamMembers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

/* =========================================================
   GET SINGLE TEAM MEMBER BY ID
========================================================= */
export const getTeamMemberById = async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({
        message: "Team member not found",
      });
    }

    res.status(200).json(teamMember);
  } catch (error) {
    console.error("Get team member by ID error:", error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

/* =========================================================
   UPDATE TEAM MEMBER
========================================================= */
export const updateTeamMember = async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({
        message: "Team member not found",
      });
    }

    const { name, role, socialMedia } = req.body;

    // ── Image update ────────────────────────────────────────
    if (req.file) {
      if (teamMember.image) {
        const oldImagePath = path.join(
          process.cwd(),
          teamMember.image.replace(/^\/+/, "")
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      teamMember.image = `/uploads/team/${req.file.filename}`;
    }

    // ── Apply updates ────────────────────────────────────────
    teamMember.name = name ?? teamMember.name;
    teamMember.role = role ?? teamMember.role;
    teamMember.socialMedia = socialMedia
      ? JSON.parse(socialMedia)
      : teamMember.socialMedia;

    await teamMember.save();

    res.status(200).json({
      message: "Team member updated successfully",
      teamMember,
    });
  } catch (error) {
    console.error("Update team member error:", error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

/* =========================================================
   DELETE TEAM MEMBER + IMAGE
========================================================= */
export const deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await Team.findByIdAndDelete(req.params.id);

    if (!teamMember) {
      return res.status(404).json({
        message: "Team member not found",
      });
    }

    const imagePath = path.join(
      process.cwd(),
      teamMember.image.replace(/^\/+/, "")
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(200).json({
      message: "Team member deleted successfully",
    });
  } catch (error) {
    console.error("Delete team member error:", error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};