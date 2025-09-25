import { Router } from "express";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
import fs from "fs";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { users as inMemoryUsers, isMongoConnected } from "../storage.js";

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use an absolute path to prevent issues with the current working directory
    const uploadPath = path.resolve(process.cwd(), "public/uploads");

    // Ensure the directory exists, creating it if necessary
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
const router = Router();

// This middleware would verify the JWT token and attach user to req
// You would need to implement this.
router.use(authMiddleware);

// Get current user's profile
router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Normalize the user object from either Mongoose or in-memory
  const user = isMongoConnected() ? req.user.toObject() : req.user;

  // Send back a consistent user profile object
  res.json({
    id: user._id || user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
  });
});

// Update current user's profile
router.patch("/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const updates = req.body;

  try {
    const user = req.user;

    // Allow name update for any user
    if (updates.name && typeof updates.name === "string") {
      user.name = updates.name.trim();
    }

    // Allow role update only if the current user is an admin
    if (updates.role && user.role === "admin") {
      if (updates.role === "admin" || updates.role === "user") {
        user.role = updates.role;
      }
    }

    if (isMongoConnected()) await user.save();
    else inMemoryUsers.set(user.email, user);

    // Generate a new token with the updated user information
    const updatedUser = isMongoConnected() ? user.toObject() : user;
    const userId = updatedUser._id?.toString() || updatedUser.id;
    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
    const token = jwt.sign(
      {
        sub: userId,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: updatedUser,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during profile update." });
  }
});

// Route to handle avatar upload
router.post("/me/avatar", upload.single("avatar"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    // The URL path to the uploaded file, which the frontend can use
    const avatarUrl = `/uploads/${req.file.filename}`;

    req.user.avatarUrl = avatarUrl;

    if (isMongoConnected()) {
      await req.user.save();
    } else {
      // Manually update the user in the in-memory map
      inMemoryUsers.set(req.user.email, req.user);
    }

    // Generate a new token with the updated user information
    const updatedUser = isMongoConnected() ? req.user.toObject() : req.user;
    const userId = updatedUser._id?.toString() || updatedUser.id;
    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
    const token = jwt.sign(
      {
        sub: userId,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return the updated user object
    res.json({
      ok: true,
      user: updatedUser,
      token: token, // Send the new token to the client
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ error: "Server error during avatar upload." });
  }
});

// Change current user's password
router.patch("/me/password", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current and new passwords are required." });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "New password must be at least 6 characters long." });
  }

  try {
    const user = req.user;

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    // Hash the new password and save it
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ error: "Server error during password change." });
  }
});

export default router;
