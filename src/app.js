import express from "express";
import cors from "cors";
import routes from "./services/routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { generalLimiter } from "./middlewares/rateLimit.middleware.js";
const app = express();
import path from "path"; // ✅ add this

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(generalLimiter); // applies to all routes

// Static folder (images)
// app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api", routes);

// Error handler
app.use(errorMiddleware);

// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

export default app;
