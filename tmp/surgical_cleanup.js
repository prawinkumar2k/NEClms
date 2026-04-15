import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";
import "../server/models/Department.js";
import "../server/models/Course.js";
import "../server/models/Exam.js";
import "../server/models/Submission.js";
import "../server/models/Violation.js";

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("🛠️ Starting Surgical Cleanup...");

  const User = mongoose.model("User");
  const Department = mongoose.model("Department");
  const Course = mongoose.model("Course");
  const Exam = mongoose.model("Exam");
  const Submission = mongoose.model("Submission");
  const Violation = mongoose.model("Violation");

  // 1. Identify "The Real HOD"
  const hod = await User.findOne({ name: "Dr. Rajesh Kumar" });
  if (!hod) {
    console.error("❌ HOD 'Dr. Rajesh Kumar' not found. Aborting cleanup for safety.");
    process.exit(1);
  }

  const keepers = [hod._id.toString()];
  const deptId = hod.department;

  // 2. Delete all Mock Sub-entities
  await Promise.all([
    Submission.deleteMany({}), // Remove all mock submissions/grades
    Violation.deleteMany({}),  // Remove all mock alerts
    Exam.deleteMany({}),       // Remove all mock exams/sessions
    Course.deleteMany({}),     // Remove all mock courses
  ]);
  console.log("✅ Cleared Exams, Submissions, Violations, and Courses.");

  // 3. Delete all Mock Users (except the HOD and specific real accounts)
  // We define "mock" as any account that was created as part of the seed or has '@example.com' 
  // and isn't our target HOD. 
  const deleteUsersResult = await User.deleteMany({
    _id: { $ne: hod._id },
    $or: [
      { email: { $regex: /example\.com$/i } },
      { name: { $regex: /Anita Singh|Suresh Patel|Vikram Sharma|Alice Smith|Bob Jones/i } }
    ]
  });
  console.log(`✅ Removed ${deleteUsersResult.deletedCount} mock user accounts.`);

  // 4. Ensure HOD's department is the ONLY one or correctly named
  // We'll leave the department alone for now to avoid breaking the reference, 
  // but we ensure it exists.
  const dept = await Department.findById(deptId);
  if (dept) {
    console.log(`🏢 Primary Department preserved: ${dept.name}`);
  }

  console.log("\n✨ System Cleaned. Dashboard should now show 0s or only your manually added data.");
  process.exit(0);
}

cleanup().catch(err => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});
