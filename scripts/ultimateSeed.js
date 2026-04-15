import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcryptjs";

// Import models via mongoose to avoid registry errors
import "../server/models/Department.js";
import "../server/models/Course.js";
import "../server/models/Exam.js";
import "../server/models/User.js";
import "../server/models/Device.js";
import "../server/models/QuestionBank.js";

async function ultimateSeed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Ultimate Seeding.");

    const User = mongoose.model("User");
    const Department = mongoose.model("Department");
    const Course = mongoose.model("Course");
    const Exam = mongoose.model("Exam");
    const Device = mongoose.model("Device");

    // 1. Clear existing non-user data for a clean slate
    await Promise.all([Device.deleteMany({})]);

    // 2. Create Departments
    let dept = await Department.findOne({ code: "AIDS" });
    if (!dept) {
      dept = await Department.create({
        name: "Artificial Intelligence & Data Science",
        code: "AIDS",
        description: "Department of AI & DS"
      });
      console.log("✅ Created Department: AIDS");
    }

    // 3. Create Users with Dept Assignment
    const pass = await bcrypt.hash("password123", 12);
    
    const admin = await User.findOneAndUpdate(
        { email: "admin@university.edu" },
        { name: "Principal Administrator", role: "admin", isActive: true, isVerified: true, mustChangePassword: false, password: pass },
        { upsert: true, new: true }
    );

    const hod = await User.findOneAndUpdate(
        { email: "hod@university.edu" },
        { name: "Dr. HOD User", role: "hod", department: dept._id, isActive: true, isVerified: true, mustChangePassword: false, password: pass },
        { upsert: true, new: true }
    );

    const faculty = await User.findOneAndUpdate(
        { email: "anita@nec.edu" },
        { name: "Dr. Anita Singh", role: "faculty", department: dept._id, isActive: true, isVerified: true, mustChangePassword: false, password: pass },
        { upsert: true, new: true }
    );

    const student = await User.findOneAndUpdate(
        { email: "student@university.edu" },
        { name: "John Student", role: "student", department: dept._id, isActive: true, isVerified: true, mustChangePassword: false, password: pass, rollNumber: "21BCE001" },
        { upsert: true, new: true }
    );

    console.log("✅ Users assigned to Department.");

    // 4. Create Courses
    let course = await Course.findOne({ code: "CS101" });
    if (!course) {
      course = await Course.create({
        title: "Introduction to Web Development",
        code: "CS101",
        description: "Fullstack MERN course",
        department: dept._id,
        faculty: faculty._id,
        semester: 4,
        academicYear: "2025-2026",
        enrolledStudents: [student._id]
      });
      console.log("✅ Created Course: CS101");
    }

    // 5. Create Exams
    let exam = await Exam.findOne({ title: "MERN Midterm Exam" });
    if (!exam) {
      exam = await Exam.create({
        title: "MERN Midterm Exam",
        description: "Assessing React & Node knowledge",
        course: course._id,
        department: dept._id,
        faculty: faculty._id,
        duration: 90,
        totalMarks: 100,
        status: "active",
        scheduledAt: new Date(),
        questions: [
            { 
              questionText: "What is the core engine of Node.js?", 
              options: { A: "V8", B: "SpiderMonkey", C: "Chakra", D: "Hermes" }, 
              correctAnswer: "A", 
              marks: 10, 
              type: "mcq" 
            }
        ]
      });
      console.log("✅ Created Active Exam.");
    }

    // 6. Create Devices
    const pcCount = await Device.countDocuments();
    if (pcCount < 10) {
      const devices = [];
      for (let i = 1; i <= 20; i++) {
        devices.push({
          hostname: `Workstation ${i}`,
          deviceId: `LAB-PC-${i}`,
          status: i <= 5 ? "online" : i <= 10 ? "locked" : "offline",
          ipAddress: `192.168.1.${100 + i}`,
          lastSeen: new Date(),
          department: dept._id
        });
      }
      await Device.insertMany(devices);
      console.log("✅ Created 20 Lab Devices.");
      // 7. Seed Question Bank for Faculty
      const QuestionBank = mongoose.model("QuestionBank");
      await QuestionBank.deleteMany({});
      
      const qbData = [
        {
          questionText: "What is the primary purpose of React Virtual DOM?",
          type: "mcq",
          options: { A: "Directly manipulate DOM", B: "Improve performance by batching updates", C: "Store data permanently", D: "Style components" },
          correctAnswer: "B",
          difficulty: "easy",
          course: course._id,
          department: dept._id,
          createdBy: faculty._id,
          topic: "Basics"
        },
        {
          questionText: "Write a function to reverse a string in JavaScript.",
          type: "coding",
          language: "javascript",
          testCases: [{ input: "'hello'", output: "'olleh'" }],
          difficulty: "medium",
          course: course._id,
          department: dept._id,
          createdBy: faculty._id,
          topic: "Strings"
        },
        {
          questionText: "Explain Middleware in Express.js.",
          type: "text",
          answerType: "long",
          difficulty: "hard",
          course: course._id,
          department: dept._id,
          createdBy: faculty._id,
          topic: "Backend"
        }
      ];
      await QuestionBank.insertMany(qbData);
      console.log("✅ Seeded Question Bank records.");

    }


    console.log("-----------------------------------------");
    console.log("🔥 ULTIMATE SEED COMPLETED 🔥");
    console.log("All systems are now fully connected to real DB data.");
    console.log("-----------------------------------------");
    process.exit(0);
  } catch (err) {
    console.error("Ultimate Seed Error:", err.message);
    process.exit(1);
  }
}

ultimateSeed();
