const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT token for the given user ID and role.
 * @param {string} userId - MongoDB _id of the user
 * @param {string} role   - "user" or "admin"
 * @returns {string} signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role: role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

module.exports = generateToken;