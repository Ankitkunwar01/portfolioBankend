import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: String,
        images: [
            {
                type: String, // stores the file path or URL
                required: true,
            },
        ],
        invest: {
            type: Boolean,
            required: true,
            default: false,
        },
        Pdf: [
            {
                type: String, // stores the file path or URL
                required: false,        
            },
        ],
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;