import Team from "../models/team.model.js";
import cloudinary from "../utils/cloudinary.js";

/* =========================================================
   CREATE TEAM MEMBER
   - Image: REQUIRED
========================================================= */
export const createTeamMember = async (req, res) => {
  try {
    const { name, role, socialMedia } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Team member image is required" });
    }

    // Upload image to Cloudinary
    const streamUpload = (fileBuffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Team" },
          (error, result) => (result ? resolve(result) : reject(error))
        );
        stream.end(fileBuffer);
      });

    const result = await streamUpload(req.file.buffer);

    const teamMember = await Team.create({
      name,
      role,
      image: result.secure_url, // Cloudinary URL
      socialMedia: socialMedia ? JSON.parse(socialMedia) : [],
    });

    res.status(201).json({
      message: "Team member created successfully",
      teamMember,
    });
  } catch (error) {
    console.error("Create team member error:", error);
    res.status(500).json({ message: error.message || "Server error" });
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
      Team.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
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
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =========================================================
   GET SINGLE TEAM MEMBER BY ID
========================================================= */
export const getTeamMemberById = async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json(teamMember);
  } catch (error) {
    console.error("Get team member by ID error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =========================================================
   UPDATE TEAM MEMBER
========================================================= */
export const updateTeamMember = async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    const { name, role, socialMedia } = req.body;

    // ── Image update ────────────────────────────────────────
    if (req.file) {
      // Delete old Cloudinary image if exists
      if (teamMember.image) {
        try {
          const publicId = teamMember.image
            .split("/")
            .slice(-1)[0]
            .split(".")[0];
          await cloudinary.uploader.destroy(`Team/${publicId}`);
        } catch (err) {
          console.warn("Old image not deleted:", err.message);
        }
      }

      // Upload new image
      const streamUpload = (fileBuffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "Team" },
            (error, result) => (result ? resolve(result) : reject(error))
          );
          stream.end(fileBuffer);
        });

      const result = await streamUpload(req.file.buffer);
      teamMember.image = result.secure_url;
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
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =========================================================
   DELETE TEAM MEMBER + IMAGE
========================================================= */
export const deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await Team.findByIdAndDelete(req.params.id);

    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Delete Cloudinary image
    if (teamMember.image) {
      try {
        const publicId = teamMember.image
          .split("/")
          .slice(-1)[0]
          .split(".")[0];
        await cloudinary.uploader.destroy(`Team/${publicId}`);
      } catch (err) {
        console.warn("Image not deleted:", err.message);
      }
    }

    res.status(200).json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Delete team member error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};
