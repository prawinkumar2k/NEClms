import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";
import "../server/models/ActivityLog.js";

async function seedActivityLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model("User");
    const ActivityLog = mongoose.model("ActivityLog");

    // Clear old logs
    await ActivityLog.deleteMany({});
    console.log("🧹 Purged legacy activity logs.");

    const admin = await User.findOne({ email: "admin@university.edu" });
    const student = await User.findOne({ email: "student@university.edu" });

    if (!admin || !student) {
      console.error("Missing seed data. Run ultimateSeed.js first.");
      process.exit(1);
    }

    const logs = [
      {
        user: admin._id,
        action: "user_created",
        resource: "John Student",
        resourceType: "User",
        ipAddress: "127.0.0.1",
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
      },
      {
        user: admin._id,
        action: "device_registered",
        resource: "Workstation 1",
        resourceType: "Device",
        ipAddress: "127.0.0.1",
        timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 mins ago
      },
      {
        user: student._id,
        action: "exam_started",
        resource: "MERN Midterm Exam",
        resourceType: "Exam",
        ipAddress: "192.168.1.101",
        timestamp: new Date()
      }
    ];

    await ActivityLog.insertMany(logs);
    console.log("✅ Seeded 3 Activity History records.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedActivityLogs();
