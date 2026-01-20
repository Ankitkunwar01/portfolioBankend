import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


console.log("JWT_SECRET =", process.env.JWT_SECRET);
if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET environment variable is missing");
    process.exit(1);
}

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Token missing",
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  

        // Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export default authMiddleware;
