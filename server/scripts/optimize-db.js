import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/edulearn_lms";

/**
 * Core performance routine to ensure all high-velocity collections 
 * have optimized compound indexes for the Exam Engine.
 */
async function optimizeDatabase() {
  try {
    console.log("🚀 Starting Database Optimization...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    // 1. Violations (High Write, High Filter)
    console.log("📦 Optimizing Violations...");
    await db.collection("violations").createIndex({ exam: 1, student: 1, timestamp: -1 });
    await db.collection("violations").createIndex({ department: 1, timestamp: -1 });
    await db.collection("violations").createIndex({ type: 1 });

    // 2. Submissions (High Lookup by Student/Exam)
    console.log("📦 Optimizing Submissions...");
    await db.collection("submissions").createIndex({ exam: 1, student: 1 }, { unique: true });
    await db.collection("submissions").createIndex({ status: 1 });
    await db.collection("submissions").createIndex({ updatedAt: -1 });

    // 3. Activity Logs
    console.log("📦 Optimizing ActivityLogs...");
    await db.collection("activitylogs").createIndex({ timestamp: -1 });
    await db.collection("activitylogs").createIndex({ user: 1, action: 1 });

    // 4. Questions (Course lookup)
    console.log("📦 Optimizing Questions...");
    await db.collection("questions").createIndex({ course: 1 });
    await db.collection("questions").createIndex({ difficulty: 1 });

    console.log("✨ Database Optimization Complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Optimization Failed:", err);
    process.exit(1);
  }
}

optimizeDatabase();
