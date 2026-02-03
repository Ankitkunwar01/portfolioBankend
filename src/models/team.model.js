import mongoose from "mongoose";

const socialMediaSchema = new mongoose.Schema(
  {
    platform: {
      type: String, // e.g. "twitter", "linkedin", "github"
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    image: {
      type: String, // image URL or uploaded file path
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    socialMedia: {
      type: [socialMediaSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Team = mongoose.model("Team", teamSchema);

export default Team;