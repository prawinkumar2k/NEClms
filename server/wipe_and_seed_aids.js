import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edulearn_lms';

// Import models
import User from "./models/User.js";
import Department from "./models/Department.js";
import Course from "./models/Course.js";
import Exam from "./models/Exam.js";
import QuestionBank from "./models/QuestionBank.js";
import Submission from "./models/Submission.js";
import Violation from "./models/Violation.js";
import Attendance from "./models/Attendance.js";
import Mark from "./models/Mark.js";
import Device from "./models/Device.js";

async function purgeAndSeed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for TOTAL AI & DS OVERHAUL...");

    // 1. Identify critical users to preserve JWT validity (Prawin and HODs)
    let prawin = await User.findOne({ name: /prawin/i }).sort({ createdAt: -1 });
    let adminHods = await User.find({ role: "hod" });
    
    const preservedUserIds = [];
    if (prawin) preservedUserIds.push(prawin._id);
    for (const h of adminHods) preservedUserIds.push(h._id);

    // 2. PURGE DATABASE
    console.log("Purging all unrelated data...");
    await Course.deleteMany({});
    await Exam.deleteMany({});
    await QuestionBank.deleteMany({});
    await Submission.deleteMany({});
    await Violation.deleteMany({});
    await Attendance.deleteMany({});
    await Mark.deleteMany({});
    await Device.deleteMany({});
    
    // Purge ALL users except prawin and HODs
    if (preservedUserIds.length > 0) {
      await User.deleteMany({ _id: { $nin: preservedUserIds } });
    } else {
      await User.deleteMany({});
    }

    // 3. Purge other departments and setup AI & DS Department
    const preservedDepIds = [];
    if (prawin && prawin.department) preservedDepIds.push(prawin.department);
    if (adminHods.length > 0 && adminHods[0].department) preservedDepIds.push(adminHods[0].department);
    
    await Department.deleteMany({ _id: { $nin: preservedDepIds } });

    let aidsDept;
    if (preservedDepIds.length > 0) {
      aidsDept = await Department.findById(preservedDepIds[0]);
      aidsDept.name = "Artificial Intelligence and Data Science";
      aidsDept.code = "AIDS";
      aidsDept.description = "Advanced AI, Deep Learning, and Analytics";
      await aidsDept.save();
    } else {
      aidsDept = await Department.create({
        name: "Artificial Intelligence and Data Science",
        code: "AIDS",
        description: "Advanced AI, Deep Learning, and Analytics"
      });
    }

    // Assign mapped department
    if (prawin) {
      prawin.department = aidsDept._id;
      prawin.role = "faculty";
      await prawin.save();
    } else {
      prawin = await User.create({
        name: "prawin",
        email: "prawin@faculty.com",
        password: "password123",
        role: "faculty",
        department: aidsDept._id,
        employeeId: "FAC-AIDS-001"
      });
    }

    // Assure hods are updated
    await User.updateMany({ role: "hod" }, { department: aidsDept._id });

    console.log("Database Purged! Creating pure AI & DS Ecosystem...");

    // 4. Create AI & DS Students
    const studentsData = [
      { name: "Alan Turing",  rollNumber: "AIDS-26-001", email: "turing@aids.com" },
      { name: "Ada Lovelace", rollNumber: "AIDS-26-002", email: "ada@aids.com" },
      { name: "Geoffrey Hinton", rollNumber: "AIDS-26-003", email: "hinton@aids.com" },
      { name: "Yann LeCun",   rollNumber: "AIDS-26-004", email: "lecun@aids.com" },
      { name: "Yoshua Bengio",rollNumber: "AIDS-26-005", email: "bengio@aids.com" },
      { name: "Fei-Fei Li",   rollNumber: "AIDS-26-006", email: "fei@aids.com" },
      { name: "Andrew Ng",    rollNumber: "AIDS-26-007", email: "ng@aids.com" },
      { name: "Ian Goodfellow",rollNumber:"AIDS-26-008", email: "ian@aids.com" },
      { name: "Demis Hassabis",rollNumber:"AIDS-26-009", email: "demis@aids.com" },
      { name: "Ilya Sutskever",rollNumber:"AIDS-26-010", email: "ilya@aids.com" }
    ];

    const studentDocs = await User.insertMany(
      studentsData.map(s => ({
        ...s,
        password: "password123",
        role: "student",
        department: aidsDept._id,
        isActive: true,
        mustChangePassword: false
      }))
    );
    const studentIds = studentDocs.map(s => s._id);

    // 5. Create AI & DS Courses
    const courseData = [
      { code: "AIDS601", title: "Machine Learning Fundamentals", semester: 6, credits: 4, syllabus: "Supervised and unsupervised learning techniques." },
      { code: "AIDS602", title: "Deep Learning & Neural Networks", semester: 6, credits: 4, syllabus: "CNNs, RNNs, Transformers, PyTorch, TensorFlow." },
      { code: "AIDS603", title: "Natural Language Processing", semester: 6, credits: 3, syllabus: "Word embeddings, sequence models, LLMs." },
      { code: "AIDS604", title: "Computer Vision Labs", semester: 6, credits: 2, syllabus: "Image recognition, object detection algorithms." }
    ];

    const courses = [];
    for (const cdata of courseData) {
      const c = await Course.create({
        ...cdata,
        department: aidsDept._id,
        faculty: prawin._id,
        academicYear: "2025-2026",
        enrolledStudents: studentIds,
      });
      courses.push(c);
    }
    
    // 6. Create Pure AI & DS Question Bank
    const qbData = [
      { questionText: "What does CNN stand for in Deep Learning?", options: { A: "Convolutional Neural Network", B: "Computer Native Network", C: "Central Neural Network", D: "Calculated Neural Node" }, correctAnswer: "A", topic: "Deep Learning", course: courses[1]._id },
      { questionText: "Which optimizer is considered adaptive in Neural Networks?", options: { A: "SGD", B: "Adam", C: "BGD", D: "Mini-batch SGD" }, correctAnswer: "B", topic: "Deep Learning", course: courses[1]._id },
      { questionText: "Which metric is best for imbalanced classification datasets?", options: { A: "Accuracy", B: "F1 Score", C: "Mean Absolute Error", D: "R-Squared" }, correctAnswer: "B", topic: "Machine Learning", course: courses[0]._id },
      { questionText: "Random Forests are an example of which type of ensemble method?", options: { A: "Boosting", B: "Stacking", C: "Bagging", D: "Cascading" }, correctAnswer: "C", topic: "Machine Learning", course: courses[0]._id },
      { questionText: "Explain the Backpropagation algorithm.", type: "text", answerType: "long", marks: 5, topic: "Neural Networks", difficulty: "hard", course: courses[1]._id },
      { questionText: "What is Tokenization in NLP?", options: { A: "Splitting text into words/sentences", B: "Encrypting text to hashes", C: "Converting text to audio", D: "Removing stop words" }, correctAnswer: "A", topic: "NLP", course: courses[2]._id },
      { questionText: "What does YOLO stand for in Computer Vision?", options: { A: "You Only Look Once", B: "Your Object Locator Online", C: "Yearly Online Learning Operations", D: "Yield Of Light Operations" }, correctAnswer: "A", topic: "Computer Vision", course: courses[3]._id }
    ];

    for (const q of qbData) {
      await QuestionBank.create({
        ...q,
        type: q.type || "mcq",
        difficulty: q.difficulty || "medium",
        marks: q.marks || 1,
        createdBy: prawin._id,
        department: aidsDept._id
      });
    }

    // 7. Seed an Active AI & DS Exam 
    await Exam.create({
       title: "Midterm Assessment - Machine Learning Pipeline",
       course: courses[0]._id,
       department: aidsDept._id,
       faculty: prawin._id,
       status: "active",
       totalMarks: 50,
       duration: 120, // 2 hours
       scheduledAt: new Date(),
       endsAt: new Date(Date.now() + 120 * 60 * 1000),
       allowedStudents: studentIds,
       questions: [
         { type: "mcq", questionText: "What is overfitting?", options: { A:"High bias", B:"High variance", C:"Low bias, low var", D:"None" }, correctAnswer: "B", marks: 5 },
         { type: "text", answerType: "long", questionText: "Derive the cost function for Logistic Regression using MLE.", marks: 15 }
       ]
    });

    console.log("✅ Total AI & DS Transformation Complete. All generic data purged.");
    process.exit(0);

  } catch (error) {
    console.error("Critical Error during wipe and seed:", error);
    process.exit(1);
  }
}

purgeAndSeed();
