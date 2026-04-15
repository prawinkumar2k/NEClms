import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";
import "../server/models/LoginLog.js";
import "../server/models/Device.js";

async function seedLoginLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model("User");
    const LoginLog = mongoose.model("LoginLog");
    const Device = mongoose.model("Device");

    // Clear old logs
    await LoginLog.deleteMany({});
    console.log("🧹 Purged legacy login logs.");

    const admin = await User.findOne({ email: "admin@university.edu" });
    const student = await User.findOne({ email: "student@university.edu" });
    const pc = await Device.findOne({ deviceId: "LAB-PC-1" });

    if (!admin || !student || !pc) {
      console.error("Missing seed data. Run ultimateSeed.js first.");
      process.exit(1);
    }

    const logs = [
      {
        user: admin._id,
        email: admin.email,
        role: "admin",
        status: "success",
        ipAddress: "192.168.1.50",
        device: pc._id,
        timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 mins ago
      },
      {
        user: student._id,
        email: student.email,
        role: "student",
        status: "success",
        ipAddress: "192.168.1.101",
        device: pc._id,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        email: "unknown@attacker.com",
        status: "failed",
        failReason: "user_not_found",
        ipAddress: "45.12.33.1",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
      }
    ];

    await LoginLog.insertMany(logs);
    console.log("✅ Seeded 3 Login History records.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedLoginLogs();
