import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        icon: {
            type: String, // URL to the icon image
            required: true
        },
        color: {
            type: String, // Hex color code
            default: "#000000"
        }
    },
    {
        timestamps: true
    }
);

const Skill = mongoose.model("Skill", skillSchema);

export default Skill;
