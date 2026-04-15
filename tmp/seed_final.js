import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";
import "../server/models/Department.js";
import "../server/models/Course.js";
import "../server/models/Exam.js";
import "../server/models/Submission.js";
import "../server/models/Violation.js";

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("🚀 Seeding NEC Nexus (AI & DS Dept)...");

  const User = mongoose.model("User");
  const Department = mongoose.model("Department");
  const Course = mongoose.model("Course");
  const Exam = mongoose.model("Exam");
  const Submission = mongoose.model("Submission");
  const Violation = mongoose.model("Violation");

  // Clear existing
  await Course.deleteMany({});
  await Exam.deleteMany({});
  await User.deleteMany({ role: { $in: ["student", "faculty"] } });

  // 1. Get Department
  let dept = await Department.findOne({ name: /Artificial Intelligence/i });
  if (!dept) {
    dept = await Department.create({
      name: "Artificial Intelligence and Data Science",
      code: "AI&DS",
      college: "Nandha Engineering College"
    });
  }
  const deptId = dept._id;

  // 2. Link PRAWIN
  await User.updateOne({ name: /PRAWIN/i }, { $set: { department: deptId } });

  // 3. Create Faculty
  const facultyData = [
    { name: "Dr. Anita Singh", email: "anita@nec.edu", role: "faculty", department: deptId, password: "password123", isActive: true, isVerified: true },
    { name: "Prof. Suresh Patel", email: "suresh@nec.edu", role: "faculty", department: deptId, password: "password123", isActive: true, isVerified: true }
  ];
  
  const faculty = [];
  for (const f of facultyData) {
    const user = new User(f);
    await user.save();
    faculty.push(user);
  }

  // 4. Create Students
  const students = [];
  for (let i = 0; i < 5; i++) {
    const s = new User({
      name: `Student ${i+1}`,
      email: `student${i+1}@nec.edu`,
      role: "student",
      department: deptId,
      password: "password123",
      rollNumber: `NEC21AD0${i+1}`,
      isActive: true,
      isVerified: true
    });
    await s.save();
    students.push(s);
  }

  // 5. Create Courses
  const courses = await Course.insertMany([
    { 
      title: "Machine Learning Concepts", code: "AIDS601", department: deptId, 
      faculty: faculty[0]._id, semester: 6, academicYear: "2024-2025", isActive: true 
    },
    { 
      title: "Deep Learning Foundations", code: "AIDS602", department: deptId, 
      faculty: faculty[1]._id, semester: 6, academicYear: "2024-2025", isActive: true 
    }
  ]);

  // 6. Create Exams
  const mockQuestions = [
    { 
      questionText: "What is Supervised Learning?", 
      options: { A: "One", B: "Two", C: "Three", D: "Four" }, 
      correctAnswer: "A", marks: 1 
    }
  ];

  const activeExam = await Exam.create({
    title: "AI Mid-Term Examination",
    course: courses[0]._id,
    faculty: faculty[0]._id,
    department: deptId,
    duration: 120,
    scheduledAt: new Date(),
    totalMarks: 50,
    status: "active",
    questions: mockQuestions
  });

  await Exam.create({
    title: "Python Lab Quiz",
    course: courses[1]._id,
    faculty: faculty[1]._id,
    department: deptId,
    duration: 60,
    scheduledAt: new Date(Date.now() + 86400000),
    totalMarks: 20,
    status: "scheduled",
    questions: mockQuestions
  });

  // 7. Simulated analytics
  await Submission.insertMany([
    { 
      student: students[0]._id, exam: activeExam._id, 
      status: "submitted", percentage: 88, 
      startedAt: new Date(Date.now() - 86400000),
      submittedAt: new Date(Date.now() - 86400000 + 3000000)
    }
  ]);

  console.log("✨ Final Seed Complete. Dashboard will now reflect the data.");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
