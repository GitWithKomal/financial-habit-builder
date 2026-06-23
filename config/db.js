const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the MONGO_URI from environment variables.
 * Exits the process if connection fails — no point running the server
 * without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;