import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  users,
  isMongoConnected,
  findUserByEmail,
  saveUser,
} from "../storage.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let user;
    let userObject;

    if (isMongoConnected()) {
      user = await User.create({
        email,
        passwordHash: passwordHash,
        name,
        role: role || "user",
        isActive: true,
      });
      userObject = user.toObject();
    } else {
      user = {
        id: Date.now().toString(),
        email,
        passwordHash,
        name: name || email.split("@")[0],
        role: role || "user",
        isActive: true,
      };
      users.set(email, user);
      userObject = user;
      console.log("User registered in memory:", { email, role: user.role });
    }

    res.status(201).json({
      ok: true,
      user: {
        email: userObject.email,
        name: userObject.name,
        id: userObject._id || userObject.id,
        role: userObject.role,
      },
    });
  } catch (e) {
    console.error("Register error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    console.log("Login attempt:", { email, userType });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const userDoc = await findUserByEmail(email);

    if (!userDoc) {
      console.log("User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Normalize the user object from either Mongoose or in-memory
    const user = isMongoConnected()
      ? userDoc.toObject({ virtuals: true })
      : userDoc;

    console.log("User found:", { email: user.email, role: user.role });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      console.log("Invalid password for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if user type matches the login section
    // Admins should be able to log in from the user section.
    // If a user is not an admin, their role must match the login section they are using.
    if (user.role !== "admin" && userType && user.role !== userType) {
      console.log("Role mismatch:", { userType, userRole: user.role });
      return res.status(403).json({
        error: `This account is registered as ${user.role}. Please use the ${user.role} login section.`,
      });
    }

    console.log("Login successful for:", {
      email: user.email,
      role: user.role,
    });

    // Generate JWT token
    const userId = isMongoConnected() ? user._id.toString() : user.id;
    const token = jwt.sign(
      {
        sub: userId,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      ok: true,
      token,
      user: {
        email: user.email,
        name: user.name,
        id: userId,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error during login" });
  }
});

// This is a placeholder for a secure password reset flow.
// You would need a server-side email library like Nodemailer.
// The client-side EmailJS implementation for password reset is for demonstration.
router.post("/reset-password", async (req, res) => {
  // This endpoint is called from the `handleChangePassword` function in Login.tsx
  // which is currently not used in the new flow but is kept for reference.
  // A full, secure implementation would look something like this:
  // 1. /forgot-password endpoint:
  //    - Client sends user's email.
  //    - Server generates a secure, short-lived token.
  //    - Server stores a hash of the token with user's ID and expiry.
  //    - Server uses an email service (e.g., Nodemailer) to send an email with a link like /reset-password?token=...
  // 2. /reset-password (POST) endpoint:
  //    - Client sends token from URL and new password.
  //    - Server validates token (exists, not expired, matches user).
  //    - Server hashes the new password and updates the user in the database.
  //    - Server invalidates the reset token.
  //    - Server sends success response.

  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email and new password are required." });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;

    await saveUser(user);

    res.json({ ok: true, message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res
      .status(500)
      .json({ error: "Server error during password reset." });
  }
});

export default router;
