import mongoose from 'mongoose';

/**
 * Connect to MongoDB Database using Mongoose
 * 
 * What it does:
 * - Attempts to connect to MongoDB Atlas (if valid MONGODB_URI is provided in .env).
 * - Falls back automatically to local MongoDB (mongodb://127.0.0.1:27017/blinkit_db) for instant local testing.
 * - Handles connection errors cleanly without crashing unexpectedly.
 */
const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = 'mongodb://127.0.0.1:27017/blinkit_db';

  try {
    // Attempt 1: Connect using environment variable MONGODB_URI
    if (primaryUri && !primaryUri.includes('<username>')) {
      const conn = await mongoose.connect(primaryUri);
      console.log(`=================================`);
      console.log(`🍃 MongoDB Atlas Connected: ${conn.connection.host}`);
      console.log(`📁 Database Name: ${conn.connection.name}`);
      console.log(`=================================`);
      return;
    }
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB Connection failed (${error.message}). Attempting local database fallback...`);
  }

  try {
    // Attempt 2: Fallback to local MongoDB instance
    const conn = await mongoose.connect(fallbackUri);
    console.log(`=================================`);
    console.log(`🍃 Local MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log(`=================================`);
  } catch (fallbackError) {
    console.error(`=================================`);
    console.error(`❌ MongoDB Connection Warning: Could not connect to Atlas or Local MongoDB.`);
    console.error(`👉 Please update backend/.env with your valid MongoDB Atlas URI.`);
    console.error(`=================================`);
  }
};

export default connectDB;
