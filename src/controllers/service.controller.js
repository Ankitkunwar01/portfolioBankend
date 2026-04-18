import Service from "../models/service.model.js";
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

export const createService = async (req, res) => {
  try {
    const { title, description, detailedDescription, color } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    let iconUrl = "";
    if (req.file) {
      iconUrl = await uploadToCloudinary(req.file.buffer, "services");
    } else {
      return res.status(400).json({ message: "Icon is required" });
    }

    const service = await Service.create({
      title,
      description,
      detailedDescription,
      icon: iconUrl,
      color,
    });
    res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json({ services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { title, description, detailedDescription, color } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (req.file) {
      const iconUrl = await uploadToCloudinary(req.file.buffer, "services");
      service.icon = iconUrl;
    }

    service.title = title || service.title;
    service.description = description || service.description;
    service.detailedDescription = detailedDescription || service.detailedDescription;
    service.color = color || service.color;

    await service.save();
    res.status(200).json({ message: "Service updated successfully", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
