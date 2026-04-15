import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Assuming this is run from the 'server' directory or project root
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edulearn_lms';

// Import all models dynamically to avoid strict paths
import User from "./models/User.js";
import Department from "./models/Department.js";
import Course from "./models/Course.js";
import Exam from "./models/Exam.js";
import QuestionBank from "./models/QuestionBank.js";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for AI & DS Seeding...");

    // 1. Setup Department
    let aidsDept = await Department.findOne({ name: "Artificial Intelligence and Data Science" });
    if (!aidsDept) {
      aidsDept = await Department.create({
        name: "Artificial Intelligence and Data Science",
        code: "AIDS",
        description: "Department for AI and Data Analytics"
      });
      console.log("Created AI & DS Department");
    } else {
      console.log("Found existing AI & DS Department:", aidsDept.code);
    }

    // 2. Setup the Faculty (prawin)
    let prawin = await User.findOne({ name: /prawin/i, role: "faculty" }).sort({ createdAt: -1 });
    if (!prawin) {
      prawin = await User.create({
        name: "prawin",
        email: "prawin@faculty.com",
        password: "password123", // Will be hashed by pre-save
        role: "faculty",
        department: aidsDept._id,
        employeeId: "FAC-AI-001"
      });
    } else {
      prawin.department = aidsDept._id;
      await prawin.save();
    }
    console.log(`Mapped faculty: ${prawin.name} -> AI & DS`);

    // 3. Create Students
    const studentPromises = [];
    for (let i = 1; i <= 20; i++) {
        studentPromises.push(User.findOneAndUpdate(
            { email: `student${i}@aids.com` },
            { 
                name: `AI Student ${i}`,
                email: `student${i}@aids.com`,
                password: "password123",
                role: "student",
                department: aidsDept._id,
                rollNumber: `AIDS2026${i.toString().padStart(3, '0')}`
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ));
    }
    const students = await Promise.all(studentPromises);
    console.log(`Created 20 AI & DS Students`);

    // 4. Create Courses
    const courseData = [
      { code: "AIDS601", title: "Machine Learning Fundamentals", semester: 6, credits: 4 },
      { code: "AIDS602", title: "Deep Learning & NLP", semester: 6, credits: 4 },
      { code: "AIDS603", title: "Big Data Analytics", semester: 6, credits: 3 },
      { code: "AIDS604", title: "Computer Vision Labs", semester: 6, credits: 2 }
    ];

    const studentIds = students.map(s => s._id);
    const savedCourses = [];

    await Course.deleteMany({ code: { $in: courseData.map(c => c.code) } });

    for (const data of courseData) {
      const c = await Course.create({
        ...data,
        department: aidsDept._id,
        faculty: prawin._id,
        academicYear: "2025-2026",
        enrolledStudents: studentIds,
      });
      savedCourses.push(c);
    }
    console.log("Created AI & DS Courses:", savedCourses.map(c => c.code).join(", "));

    // 5. Create Question Bank for AI & DS
    const qbData = [
      { questionText: "What does CNN stand for in Deep Learning?", options: { A: "Convolutional Neural Network", B: "Computer Native Network", C: "Central Neural Network", D: "Calculated Neural Node" }, correctAnswer: "A", topic: "Deep Learning" },
      { questionText: "Which metric is best for imbalanced classification datasets?", options: { A: "Accuracy", B: "F1 Score", C: "Mean Absolute Error", D: "R-Squared" }, correctAnswer: "B", topic: "Machine Learning" },
      { questionText: "Explain the Backpropagation algorithm.", type: "text", answerType: "long", marks: 5, topic: "Neural Networks", difficulty: "hard" },
      { questionText: "What is Tokenization in NLP?", options: { A: "Splitting text into words/sentences", B: "Encrypting text to hashes", C: "Converting text to audio", D: "Removing stop words" }, correctAnswer: "A", topic: "NLP" }
    ];

    await QuestionBank.deleteMany({ createdBy: prawin._id });
    for (const q of qbData) {
      await QuestionBank.create({
        ...q,
        type: q.type || "mcq",
        course: savedCourses[0]._id, // Attach to AIDS601
        difficulty: q.difficulty || "medium",
        marks: q.marks || 1,
        createdBy: prawin._id,
        department: aidsDept._id
      });
    }
    console.log("Added AI & DS Intelligence entries to Question Bank");

    console.log("✅ Seed complete! You can now use course codes like AIDS601, AIDS602 in the Forge.");
    process.exit(0);

  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
}

seed();
