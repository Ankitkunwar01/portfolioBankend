import express from "express";
import cors from "cors";
import routes from "./services/routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// ========================
// ES Module fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================
// Allowed Origins (PRODUCTION SAFE)
const allowedOrigins = [
  "https://ankitkunwar.vercel.app",
  "https://www.ankit-kunwar.com.np",
  "https://ankit-kunwar.com.np"
];

// ========================
// CORS CONFIG (IMPORTANT FIX)
app.use(
  cors({
    origin: function (origin, callback) {
      // allow tools like Postman or server-to-server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Handle preflight requests explicitly
app.options("*", cors());

// ========================
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// Static files (uploads)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// ========================
// API ROUTES
app.use("/api", routes);

// ========================
// Global error handler (your custom middleware)
app.use(errorMiddleware);

// ========================
// Final fallback error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Server Error"
  });
});

export default app;