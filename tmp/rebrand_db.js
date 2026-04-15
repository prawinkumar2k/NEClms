import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/Department.js";
import "../server/models/User.js";

async function rebrand() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("🏙️ Rebranding Database for Nandha Engineering College...");

  const Department = mongoose.model("Department");
  const User = mongoose.model("User");

  // 1. Find or Update Department
  const dept = await Department.findOne({}); // Pick the first one as primary for now
  if (dept) {
    dept.name = "Artificial Intelligence and Data Science";
    dept.code = "AI&DS";
    dept.college = "Nandha Engineering College";
    await dept.save();
    console.log(`✅ Department updated to: ${dept.name}`);
  }

  // 2. Update HOD profile if needed (already Dr. Rajesh Kumar)
  const hod = await User.findOne({ role: "hod" });
  if (hod) {
    console.log(`✅ HOD ${hod.name} confirmed for AI & DS.`);
  }

  process.exit(0);
}

rebrand();
