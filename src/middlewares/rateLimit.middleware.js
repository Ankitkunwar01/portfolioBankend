import rateLimit from "express-rate-limit";

// General API rate limiter - applies to all routes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max requests per IP
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Login rate limiter - strict limit for authentication attempts
export const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // 5 attempts only
    message: {
        success: false,
        message: "Too many login attempts. Try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Upload rate limiter - prevents abuse of file upload endpoints
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: {
        success: false,
        message: "Upload limit exceeded. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// User-specific rate limiter - tracks by authenticated user or IP
export const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per user/IP
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
