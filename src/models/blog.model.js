import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        author: {
            type: String,
            default: "Ankit Kunwar"
        },
        image: {
            type: String // URL to blog image
        },
        category: {
            type: String
        },
        tags: [String]
    },
    {
        timestamps: true
    }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
