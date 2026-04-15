import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";
import "../server/models/Exam.js";

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model("User");
  const Exam = mongoose.model("Exam");
  const hod = await User.findOne({ name: "Dr. Rajesh Kumar" });
  
  if (hod) {
    const deptId = hod.department;
    console.log("Department ID:", deptId.toString());
    const faculty = await User.countDocuments({ department: deptId, role: "faculty" });
    const students = await User.countDocuments({ department: deptId, role: "student" });
    const exams = await Exam.countDocuments({ department: deptId });
    console.log("Counts:", { faculty, students, exams });
  }
  process.exit(0);
}
verify();
