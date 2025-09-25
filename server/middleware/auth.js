import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { users as inMemoryUsers, isMongoConnected } from "../storage.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// This is a placeholder for authentication middleware.
// In a real application, you would verify the JWT from the Authorization header.
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication token required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user;

    if (isMongoConnected()) {
      // MongoDB is connected
      user = await User.findById(decoded.sub);
    } else {
      // In-memory storage
      // Find user by ID in the in-memory map
      for (const u of inMemoryUsers.values()) {
        if (u.id === decoded.sub) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = user; // Attach the user object to the request
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};
