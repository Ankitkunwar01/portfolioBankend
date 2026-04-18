import Skill from "../models/skill.model.js";
import cloudinary from "../utils/cloudinary.js";

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

export const createSkill = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    let iconUrl = "";
    if (req.file) {
      iconUrl = await uploadToCloudinary(req.file.buffer, "skills");
    } else {
        return res.status(400).json({ message: "Icon is required" });
    }

    const skill = await Skill.create({ name, icon: iconUrl, color });
    res.status(201).json({ message: "Skill created successfully", skill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ name: 1 });
    res.status(200).json({ skills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { name, color } = req.body;
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    if (req.file) {
      // Upload new icon
      const iconUrl = await uploadToCloudinary(req.file.buffer, "skills");
      skill.icon = iconUrl;
    }

    skill.name = name || skill.name;
    skill.color = color || skill.color;

    await skill.save();
    res.status(200).json({ message: "Skill updated successfully", skill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
