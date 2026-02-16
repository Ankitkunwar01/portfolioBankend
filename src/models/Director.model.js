import mongoose from "mongoose";

const DirectorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    alternativeName: {
      type: String,
      
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String, // store image URL or filename
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    education: {
      type: String,
    },

    experience: {
      type: String, // e.g. "15+ Years"
    },

    specialization: {
      type: String,
    },

    roles: {
      type: [String], // array of roles
      default: [],
    },

    investments: {
      type: [String],
      default: [],
    },

    community: {
      type: [String],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    socials: {
      type: Map,
      of: String, // e.g. { linkedin: "", twitter: "" }
      default: {},
    },
    order: { type: Number, default: 0 },

    portfolio: {
      type: String, // URL
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Director =
  mongoose.models.Director || mongoose.model("Director", DirectorSchema);

export default Director;