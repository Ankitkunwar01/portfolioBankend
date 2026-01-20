import Admin from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse } from "../utils/response.js";

// Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password });

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return errorResponse(res, 400, "Email and password are required");
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    console.log('Admin lookup result:', admin ? 'found' : 'not found');
    
    if (!admin) {
      console.log('Admin not found for email:', email);
      return errorResponse(res, 401, "Invalid credentials");
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password for email:', email);
      return errorResponse(res, 401, "Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return success response with token and admin info
    return successResponse(res, 200, "Login successful", {
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, 500, "Login failed");
  }
};

// Verify Token (for checking if user is authenticated)
export const verifyToken = async (req, res) => {
  try {
    // User is already verified by auth middleware
    const admin = await Admin.findById(req.user.id).select("-password");
    
    if (!admin) {
      return errorResponse(res, 404, "Admin not found");
    }

    return successResponse(res, 200, "Token verified", {
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Verify token error:", error);
    return errorResponse(res, 500, "Verification failed");
  }
};

// Create initial admin (for setup - should be removed in production)
export const createAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return errorResponse(res, 400, "Admin already exists");
    }

    // Create new admin
    const admin = new Admin({
      email,
      password,
      name: name || "Admin User",
    });

    await admin.save();

    return successResponse(res, 201, "Admin created successfully", {
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return errorResponse(res, 500, "Failed to create admin");
  }
};



