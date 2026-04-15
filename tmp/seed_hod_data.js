import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";
import "../server/models/Department.js";
import "../server/models/Course.js";
import "../server/models/Exam.js";
import "../server/models/Submission.js";

async function seedData() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model("User");
  const Department = mongoose.model("Department");
  const Course = mongoose.model("Course");
  const Exam = mongoose.model("Exam");
  const Submission = mongoose.model("Submission");

  const hod = await User.findOne({ role: "hod" });
  if (!hod || !hod.department) {
    console.error("❌ No HOD with department found. Please log in once.");
    process.exit(1);
  }

  const deptId = hod.department;
  console.log(`🌱 Seeding data for Department: ${deptId}`);

  // 1. Create a Course
  let course = await Course.findOne({ department: deptId });
  if (!course) {
    course = await Course.create({
      title: "Advanced AI Systems",
      code: "CS402",
      department: deptId,
      description: "Neural networks and deep learning",
      isActive: true
    });
  }

  // 2. Create Faculty
  const facultyCount = await User.countDocuments({ department: deptId, role: "faculty" });
  if (facultyCount < 2) {
    await User.create([
      { name: "Dr. Alice Smith", email: "alice@dept.com", password: "password123", role: "faculty", department: deptId },
      { name: "Prof. Bob Jones", email: "bob@dept.com", password: "password123", role: "faculty", department: deptId }
    ]);
  }

  // 3. Create Students
  const studentCount = await User.countDocuments({ department: deptId, role: "student" });
  if (studentCount < 5) {
    const students = [];
    for (let i = 1; i <= 5; i++) {
      students.push({
        name: `Student ${i}`,
        email: `student${i}@dept.com`,
        password: "password123",
        role: "student",
        department: deptId,
        rollNumber: `ROLL00${i}`
      });
    }
    await User.create(students);
  }

  // 4. Create an Active Exam
  const faculty = await User.findOne({ department: deptId, role: "faculty" });
  const activeExam = await Exam.create({
    title: "Midterm: Intelligence Systems",
    course: course._id,
    faculty: faculty._id,
    department: deptId,
    scheduledAt: new Date(),
    duration: 60,
    totalMarks: 50,
    status: "active",
    questions: [],
    security: { disableCopyPaste: true, detectTabSwitch: true }
  });

  // 5. Create some submissions/analytics
  const someStudent = await User.findOne({ department: deptId, role: "student" });
  await Submission.create({
    exam: activeExam._id,
    student: someStudent._id,
    status: "submitted",
    answers: [],
    score: 85,
    percentage: 85,
    totalViolations: 0,
    violations: []
  });

  console.log("✅ Seeding complete! Refresh your dashboard.");
  process.exit(0);
}

seedData();
