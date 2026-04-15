import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";
import "../server/models/Department.js";
import "../server/models/Course.js";
import "../server/models/Exam.js";
import "../server/models/Submission.js";

async function testApiLogic() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model("User");
  const Course = mongoose.model("Course");
  const Exam = mongoose.model("Exam");
  const Submission = mongoose.model("Submission");

  const hod = await User.findOne({ role: "hod" });
  console.log("Testing as HOD:", hod.name, "Dept:", hod.department);

  const deptId = hod.department;
  
  const [facultyCount, studentCount, activeCourses, activeExams] = await Promise.all([
    User.countDocuments({ department: deptId, role: "faculty" }),
    User.countDocuments({ department: deptId, role: "student" }),
    Course.countDocuments({ department: deptId, isActive: true }),
    Exam.countDocuments({ department: deptId, status: "active" })
  ]);

  console.log("API Logic Results:", {
    facultyCount,
    studentCount,
    activeCourses,
    activeExams
  });

  process.exit(0);
}

testApiLogic();
