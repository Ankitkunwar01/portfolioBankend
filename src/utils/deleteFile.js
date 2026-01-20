import fs from "fs";
import path from "path";

const deleteFile = (filePath) => {
    try {
        if (!filePath) return;

        const absolutePath = path.resolve(filePath);

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }
    } catch (error) {
        console.error("File delete error:", error.message);
    }
};

export default deleteFile;
