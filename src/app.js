import express from "express";
import cors from "cors";
import routes from "./services/routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// ES module fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================
// CORS (IMPORTANT for Vercel + Render)
app.use(cors({
  origin: "https://ankitkunwar.vercel.app",
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// Uploads (optional)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ========================
// API ROUTES ONLY
app.use("/api", routes);

// ========================
// Error middleware
app.use(errorMiddleware);

// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

export default app;