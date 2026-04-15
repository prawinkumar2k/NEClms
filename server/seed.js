/**
 * EduLearn LMS — Database Seed Script
 * Run: node server/seed.js
 */

import "dotenv/config";
import mongoose from "mongoose";

import User       from "./models/User.js";
import Department from "./models/Department.js";
import Course     from "./models/Course.js";
import Exam       from "./models/Exam.js";
import QuestionBank from "./models/QuestionBank.js";
import Device     from "./models/Device.js";
import Attendance from "./models/Attendance.js";
import Mark       from "./models/Mark.js";
import Notification from "./models/Notification.js";
import Settings   from "./models/Settings.js";
import LoginLog   from "./models/LoginLog.js";
import ActivityLog from "./models/ActivityLog.js";
import Lab         from "./models/Lab.js";
import StudentProfile from "./models/StudentProfile.js";
import Submission  from "./models/Submission.js";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/edulearn_lms";

async function seed() {
  console.log("\n🌱  EduLearn LMS — Seeding Database...");
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected:", MONGO_URI, "\n");

  // ─── Wipe ───────────────────────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany(), Department.deleteMany(), Course.deleteMany(),
    Exam.deleteMany(), QuestionBank.deleteMany(), Device.deleteMany(),
    Attendance.deleteMany(), Mark.deleteMany(), Notification.deleteMany(),
    Settings.deleteMany(), LoginLog.deleteMany(), ActivityLog.deleteMany(),
    Lab.deleteMany(), StudentProfile.deleteMany(), Submission.deleteMany(),
  ]);
  console.log("🗑️   Cleared old data\n");

  // ─── 1. Settings ────────────────────────────────────────────────────────────
  await Settings.create({
    institutionName: "EduLearn University",
    institutionEmail: "admin@edulearn.edu",
    currentAcademicYear: "2024-2025",
    currentSemester: 4,
    security: {
      disableCopyPaste: true, detectTabSwitch: true,
      requireFullscreen: true, blockRightClick: true,
      detectDevTools: false, lockOnViolation: false,
      requireWebcam: false, screenWatermark: true, maxViolations: 5,
    },
  });
  console.log("⚙️   Settings ✓");

  // ─── 2. Departments ──────────────────────────────────────────────────────────
  const depts = await Department.insertMany([
    { name: "Computer Science & Engineering", code: "CSE", description: "Core CS programs" },
    { name: "Electronics & Communication",   code: "ECE", description: "Electronics programs" },
    { name: "Mechanical Engineering",        code: "MECH", description: "Mechanical studies" },
  ]);
  const [cse, ece] = depts;
  console.log("🏛️   Departments ✓ (CSE, ECE, MECH)");

  // ─── 2.5 Labs ───────────────────────────────────────────────────────────────
  const labs = await Lab.insertMany([
    { name: "Lab A", code: "LABA", department: cse._id, capacity: 30, location: "Block B, Room 201" },
    { name: "Lab B", code: "LABB", department: cse._id, capacity: 25, location: "Block C, Room 102" },
  ]);
  const [labA, labB] = labs;
  console.log("🏫  Labs ✓ (Lab A, Lab B)");

  // ─── 3. Users — use save() so pre-save hook hashes password once ─────────────
  const createUser = async (data) => {
    const u = new User(data);
    await u.save();
    return u;
  };

  const admin  = await createUser({ name: "Super Admin",    email: "admin@example.com",    password: "password", role: "admin",   department: cse._id, isActive: true, isVerified: true, mustChangePassword: false });
  const hodCse = await createUser({ name: "Dr. Rajesh Kumar", email: "hod@example.com",    password: "password", role: "hod",     department: cse._id, employeeId: "HOD001", isActive: true, isVerified: true, mustChangePassword: false });
  const hodEce = await createUser({ name: "Dr. Priya Menon",  email: "hod.ece@example.com", password: "password", role: "hod",    department: ece._id, employeeId: "HOD002", isActive: true, isVerified: true, mustChangePassword: false });

  await Department.updateOne({ _id: cse._id }, { hod: hodCse._id });
  await Department.updateOne({ _id: ece._id }, { hod: hodEce._id });

  const fac1 = await createUser({ name: "Dr. Anita Singh",   email: "faculty@example.com",  password: "password", role: "faculty", department: cse._id, employeeId: "FAC001", isActive: true, isVerified: true, mustChangePassword: false });
  const fac2 = await createUser({ name: "Prof. Suresh Patel",email: "faculty2@example.com", password: "password", role: "faculty", department: cse._id, employeeId: "FAC002", isActive: true, isVerified: true, mustChangePassword: false });
  await createUser({ name: "Dr. Rekha Nair",    email: "faculty3@example.com", password: "password", role: "faculty", department: ece._id, employeeId: "FAC003", isActive: true, isVerified: true, mustChangePassword: false });
  await createUser({ name: "Prof. Vikram Sharma",email: "faculty4@example.com",password: "password", role: "faculty", department: cse._id, employeeId: "FAC004", isActive: true, isVerified: true, mustChangePassword: false });

  const studentNames = [
    ["Prawin Kumar",   "student@example.com",  "CS21001"],
    ["Arjun Reddy",    "student2@example.com", "CS21002"],
    ["Sneha Iyer",     "student3@example.com", "CS21003"],
    ["Mohammed Irfan", "student4@example.com", "CS21004"],
    ["Divya Lakshmi",  "student5@example.com", "CS21005"],
    ["Rahul Verma",    "student6@example.com", "CS21006"],
    ["Kavitha Subash", "student7@example.com", "CS21007"],
    ["Aarav Mehta",    "student8@example.com", "CS21008"],
  ];
  const students = [];
  for (const [name, email, roll] of studentNames) {
    const s = await createUser({ name, email, password: "password", role: "student", department: cse._id, rollNumber: roll, isActive: true, isVerified: true, mustChangePassword: false });
    students.push(s);
    
    // Create Student Profile
    await StudentProfile.create({
      user: s._id,
      rollNumber: roll,
      batch: "2021-2025",
      currentSemester: 4,
      enrolledCourses: [], // will fill later
      gpa: 8.5,
      attendancePercentage: 92
    });
  }
  await createUser({ name: "Lab Client PC", email: "client@example.com", password: "password", role: "client", department: cse._id, isActive: true, isVerified: true, mustChangePassword: false });

  console.log("👥  Users ✓ (1 admin + 2 hod + 4 faculty + 8 students + 1 client = 16)");

  // ─── 4. Courses ──────────────────────────────────────────────────────────────
  const sid = students.map((s) => s._id);
  const [ds, wd, db] = await Course.insertMany([
    { title: "Data Structures & Algorithms", code: "CS301", description: "Trees, graphs, sorting.", department: cse._id, faculty: fac1._id, semester: 4, credits: 4, maxStudents: 60, enrolledStudents: sid, academicYear: "2024-2025" },
    { title: "Web Development",              code: "CS405", description: "HTML/CSS/React/REST APIs.", department: cse._id, faculty: fac2._id, semester: 4, credits: 3, maxStudents: 60, enrolledStudents: sid, academicYear: "2024-2025" },
    { title: "Database Management Systems",  code: "CS302", description: "SQL, NoSQL, normalization.", department: cse._id, faculty: fac1._id, semester: 4, credits: 4, maxStudents: 60, enrolledStudents: sid, academicYear: "2024-2025" },
  ]);

  // Update Student Profiles with enrolled courses
  await StudentProfile.updateMany({ user: { $in: sid } }, { $set: { enrolledCourses: [ds._id, wd._id, db._id] } });
  
  console.log("📚  Courses ✓ (CS301, CS405, CS302)");

  // ─── 5. Question Bank ────────────────────────────────────────────────────────
  await QuestionBank.insertMany([
    { questionText: "Time complexity of binary search?", options: { A:"O(n)", B:"O(log n)", C:"O(n²)", D:"O(1)" }, correctAnswer:"B", marks:1, difficulty:"easy", topic:"Searching", course:ds._id, department:cse._id, createdBy:fac1._id, type:"MCQ" },
    { questionText: "Which data structure uses LIFO?",   options: { A:"Queue", B:"Heap", C:"Stack", D:"Linked List" }, correctAnswer:"C", marks:1, difficulty:"easy", topic:"Stack", course:ds._id, department:cse._id, createdBy:fac1._id, type:"MCQ" },
    { questionText: "What does REST stand for?",         options: { A:"Representational State Transfer", B:"Remote Execution", C:"Rapid Encoding", D:"Resource Enum" }, correctAnswer:"A", marks:1, difficulty:"easy", topic:"APIs", course:wd._id, department:cse._id, createdBy:fac2._id, type:"MCQ" },
    { questionText: "SQL clause to filter rows?",        options: { A:"GROUP BY", B:"ORDER BY", C:"WHERE", D:"HAVING" }, correctAnswer:"C", marks:1, difficulty:"easy", topic:"SQL", course:db._id, department:cse._id, createdBy:fac1._id, type:"MCQ" },
    { questionText: "ACID stands for?",                  options: { A:"Atomicity Consistency Isolation Durability", B:"Access Control Index Data", C:"Async Cache Integrity Delete", D:"None" }, correctAnswer:"A", marks:2, difficulty:"medium", topic:"Transactions", course:db._id, department:cse._id, createdBy:fac1._id, type:"MCQ" },
  ]);
  console.log("❓  Question Bank ✓ (5 questions)");

  // ─── 6. Exams ────────────────────────────────────────────────────────────────
  const inTwoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const inOneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const securityDefaults = { disableCopyPaste:true, detectTabSwitch:true, requireFullscreen:true, blockRightClick:true, detectDevTools:false, maxViolations:5 };

  const examDS = await Exam.create({
    title: "Data Structures Mid-Term",
    description: "Covers stacks, queues, trees, graphs and sorting.",
    course: ds._id, faculty: fac1._id, department: cse._id,
    questions: [
      { questionText:"Height of complete binary tree with 7 nodes?",  options:{A:"2",B:"3",C:"4",D:"7"}, correctAnswer:"B", marks:1, difficulty:"easy",   topic:"Trees" },
      { questionText:"NOT a linear data structure?",                   options:{A:"Array",B:"Queue",C:"Tree",D:"Stack"}, correctAnswer:"C", marks:1, difficulty:"easy",   topic:"Basics" },
      { questionText:"Time complexity of binary search?",              options:{A:"O(n)",B:"O(log n)",C:"O(n log n)",D:"O(1)"}, correctAnswer:"B", marks:1, difficulty:"easy",   topic:"Searching" },
      { questionText:"DFS uses which internal data structure?",        options:{A:"Queue",B:"Heap",C:"Stack",D:"Array"}, correctAnswer:"C", marks:2, difficulty:"medium", topic:"Graphs" },
      { questionText:"Worst case complexity of QuickSort?",            options:{A:"O(n log n)",B:"O(n)",C:"O(n²)",D:"O(log n)"}, correctAnswer:"C", marks:2, difficulty:"hard",   topic:"Sorting" },
    ],
    totalMarks: 7, duration: 60, scheduledAt: inTwoDays,
    allowedStudents: sid, status: "scheduled", passingMarks: 4,
    isPublished: true, approvedByHod: true, approvedBy: hodCse._id,
    security: securityDefaults,
  });

  const examDB = await Exam.create({
    title: "DBMS Final Exam",
    description: "Complete database theory and SQL.",
    course: db._id, faculty: fac1._id, department: cse._id,
    questions: [
      { questionText:"SQL command to retrieve data?",                  options:{A:"INSERT",B:"UPDATE",C:"SELECT",D:"DELETE"}, correctAnswer:"C", marks:1, difficulty:"easy",   topic:"SQL" },
      { questionText:"Which is a NoSQL database?",                     options:{A:"MySQL",B:"MongoDB",C:"PostgreSQL",D:"Oracle"}, correctAnswer:"B", marks:1, difficulty:"easy",   topic:"Databases" },
      { questionText:"ACID property ensuring all-or-nothing?",         options:{A:"Consistency",B:"Isolation",C:"Durability",D:"Atomicity"}, correctAnswer:"D", marks:2, difficulty:"medium", topic:"Transactions" },
      { questionText:"What is a foreign key?",                         options:{A:"Encryption key",B:"Primary key of another table",C:"Unique key same table",D:"Non-null key"}, correctAnswer:"B", marks:1, difficulty:"easy",   topic:"Schema" },
      { questionText:"Normalization means?",                           options:{A:"Encrypting data",B:"Reducing redundancy",C:"Indexing columns",D:"Backing up"}, correctAnswer:"B", marks:2, difficulty:"medium", topic:"Normalization" },
    ],
    totalMarks: 7, duration: 90, scheduledAt: inOneWeek,
    allowedStudents: sid, status: "scheduled", passingMarks: 5,
    isPublished: true, approvedByHod: false,
    security: { ...securityDefaults, maxViolations: 3 },
  });
  console.log("📝  Exams ✓ (Data Structures Mid-Term | DBMS Final)");

  // ─── 7. Devices ──────────────────────────────────────────────────────────────
  const labADevices = Array.from({ length: 10 }, (_, i) => ({
    hostname: `LAB-A-PC-${String(i+1).padStart(2,"0")}`, ip: `192.168.1.${100+i}`,
    mac: `AA:BB:CC:DD:EE:${String(i+10).padStart(2,"0")}`, lab: labA._id,
    location: "Block B, Room 201", os: "Windows 11",
    deviceId: `DEV-LABA-${i+1}`, department: cse._id, registeredBy: admin._id,
    status: i < 3 ? "online" : "offline", lastSeen: new Date(), isActive: true,
  }));
  const labBDevices = Array.from({ length: 8 }, (_, i) => ({
    hostname: `LAB-B-PC-${String(i+1).padStart(2,"0")}`, ip: `192.168.2.${100+i}`,
    mac: `FF:EE:DD:CC:BB:${String(i+10).padStart(2,"0")}`, lab: labB._id,
    location: "Block C, Room 102", os: "Windows 10",
    deviceId: `DEV-LABB-${i+1}`, department: cse._id, registeredBy: admin._id,
    status: "offline", lastSeen: new Date(), isActive: true,
  }));
  const createdDevices = await Device.insertMany([...labADevices, ...labBDevices]);
  console.log("🖥️   Devices ✓ (10 Lab A + 8 Lab B = 18 devices)");

  // ─── 7.5 Exam Submissions (Attempts) ─────────────────────────────────────────
  await Submission.create([
    {
      exam: examDS._id,
      student: students[0]._id,
      device: createdDevices[0]._id,
      status: "submitted",
      marksObtained: 6,
      totalMarks: 7,
      percentage: 85.7,
      startedAt: new Date(Date.now() - 3600000),
      submittedAt: new Date(),
      violations: [
        { type: "tab_switch", timestamp: new Date(Date.now() - 1800000) }
      ],
      totalViolations: 1
    },
    {
      exam: examDS._id,
      student: students[1]._id,
      device: createdDevices[1]._id,
      status: "in_progress",
      startedAt: new Date(),
      violations: [],
      totalViolations: 0
    }
  ]);
  console.log("📥  Submissions ✓ (1 completed, 1 in-progress)");

  // ─── 8. Attendance ───────────────────────────────────────────────────────────
  const today = new Date(); today.setHours(9, 0, 0, 0);
  await Attendance.create({
    course: ds._id, faculty: fac1._id, date: today,
    period: "1st Hour", topic: "Binary Trees",
    records: students.map((s, i) => ({ student: s._id, status: i < 6 ? "present" : i === 6 ? "late" : "absent" })),
    totalStudents: students.length, presentCount: 7,
  });
  console.log("📋  Attendance ✓ (1 session)");

  // ─── 9. Marks ────────────────────────────────────────────────────────────────
  const rawScores = [38, 42, 35, 45, 40, 28, 48, 33];
  const toGrade = (p) => p>=90?"A+":p>=80?"A":p>=70?"B+":p>=60?"B":p>=50?"C":p>=40?"D":"F";
  await Mark.create({
    course: ds._id, faculty: fac1._id, type: "CAT1",
    title: "CAT 1 — Trees & Graphs", totalMarks: 50,
    conductedOn: new Date("2024-03-10"), isPublished: true,
    entries: students.map((s, i) => {
      const m = rawScores[i]; const pct = (m/50)*100;
      return { student: s._id, marksObtained: m, totalMarks: 50, percentage: pct, grade: toGrade(pct), passed: pct >= 40 };
    }),
  });
  console.log("📊  Marks ✓ (CAT1 for CS301)");

  // ─── 10. Notifications ───────────────────────────────────────────────────────
  await Notification.insertMany([
    ...students.map((s) => ({
      recipient: s._id, sender: fac1._id,
      title: "Exam Scheduled: Data Structures Mid-Term",
      message: `Your exam is scheduled on ${inTwoDays.toDateString()} at 9:00 AM.`,
      type: "exam_scheduled", link: "/student/exams",
    })),
    { recipient: hodCse._id, sender: fac1._id, title: "Approval Needed: DBMS Final", message: "Dr. Anita Singh submitted DBMS Final for HOD approval.", type: "approval_needed", link: "/hod/exams" },
    { recipient: admin._id, title: "System Ready", message: "Database seeded. 16 users, 3 courses, 2 exams, 18 devices created.", type: "system", link: "/admin/dashboard" },
  ]);
  console.log("🔔  Notifications ✓");

  // ─── 11. Logs ────────────────────────────────────────────────────────────────
  await LoginLog.insertMany([
    { user: admin._id,     email: "admin@example.com",   role: "admin",   ip: "127.0.0.1",    status: "success" },
    { user: fac1._id,      email: "faculty@example.com", role: "faculty", ip: "127.0.0.1",    status: "success" },
    { user: students[0]._id, email: "student@example.com", role: "student", ip: "192.168.1.102", status: "success" },
    { email: "unknown@test.com", ip: "10.0.0.1", status: "failed", failReason: "not_found" },
  ]);
  await ActivityLog.insertMany([
    { user: admin._id, action: "user_created",     resource: "Dr. Anita Singh",         resourceType: "User",   ip: "127.0.0.1" },
    { user: admin._id, action: "device_registered",resource: "LAB-A-PC-01",              resourceType: "Device", ip: "127.0.0.1" },
    { user: fac1._id,  action: "exam_started",     resource: "Data Structures Mid-Term", resourceType: "Exam",   ip: "127.0.0.1" },
  ]);
  console.log("📜  Logs ✓");

  // ─── Summary ─────────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(52));
  console.log("  ✅  EduLearn LMS Database Seeded Successfully!");
  console.log("═".repeat(52));
  console.log("  🔑  Login Credentials (password: password)");
  console.log("  Admin   →  admin@example.com");
  console.log("  HOD     →  hod@example.com");
  console.log("  Faculty →  faculty@example.com");
  console.log("  Student →  student@example.com");
  console.log("═".repeat(52));
  console.log("  📦  Collections seeded:");
  const colls = await mongoose.connection.db.listCollections().toArray();
  for (const c of colls) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`     ${c.name.padEnd(18)} → ${count} document(s)`);
  }
  console.log("═".repeat(52) + "\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("\n❌ Seed Error:", err.message);
  console.error(err.stack);
  mongoose.disconnect();
  process.exit(1);
});
