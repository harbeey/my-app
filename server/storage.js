import mongoose from "mongoose";
import User from "./models/User.js";

// Temporary in-memory storage for development
const users = new Map();

// Check if we're connected to MongoDB
const isMongoConnected = () => {
  // 1 means connected
  return mongoose.connection.readyState === 1;
};

/**
 * Finds a user by email from either the database or in-memory store.
 * @param {string} email The user's email.
 * @returns {Promise<User | object | null>}
 */
export async function findUserByEmail(email) {
  if (isMongoConnected()) {
    return await User.findOne({ email });
  }
  return users.get(email) || null;
}

/**
 * Saves a user to either the database or in-memory store.
 * @param {User | object} user The user object to save.
 */
export async function saveUser(user) {
  if (isMongoConnected() && user.save) {
    await user.save();
  } else if (user.email) {
    users.set(user.email, user);
  }
}

// Export for other modules to access
export { users, isMongoConnected };
