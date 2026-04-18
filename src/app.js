import express from "express";
import cors from "cors";
import routes from "./services/routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================
// Static uploads (safe)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ============================
// API routes
app.use("/api", routes);

// ============================
// FRONTEND SETUP (FIXED)
// Use "dist" for Vite OR "build" for React CRA
const frontendPath = path.join(process.cwd(), "dist"); 
// change to "build" if using CRA

app.use(express.static(frontendPath));

// ============================
// SPA fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ============================
// Error middleware (clean)
app.use(errorMiddleware);

app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

export default app;