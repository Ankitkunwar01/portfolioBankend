import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    images: [
      {
        type: String,
        required: true,
      },
    ],

    // 👇 ADD THIS
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // must match your User model name
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Media = mongoose.model("Media", mediaSchema);

export default Media;
