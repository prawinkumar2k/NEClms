import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// ─── Route handlers ───────────────────────────────────────────────────────────
import { handleDemo } from "./routes/demo.js";
import { handleLogin, handleLogout } from "./routes/auth.js";
import { handleGetUsers, handleGetUserById, handleBulkUpload, handleCreateUser, handleUpdateUser, handleDeleteUser } from "./routes/users.js";
import { handleGetExams, handleGetExamById } from "./routes/exams.js";
import { handleGetDevices, handleRegisterDevice, handleDeviceHeartbeat } from "./routes/devices.js";
import { 
  handleGetSystemStats, 
  handleGetFacultyStats, 
  handleGetStudentStats, 
  handleGetFacultyResults, 
  handleGetFacultyMonitoring, 
  handleGetStudentResults 
} from "./routes/reports.js";
import { 
  handleGetHODStats, 
  handleGetHODExams, 
  handleGetHODFacultyStatus, 
  handleGetHODStudentsMonitoring, 
  handleGetHODAlerts, 
  handleGetHODAnalytics,
  handleCreateHODFaculty,
  handleCreateHODStudent,
  handleHODBulkUpload,
  handleCreateHODExam
} from "./routes/hod.js";
import { 
  handleStartExam, 
  handleUpdateAnswers, 
  handleSubmitExam, 
  handleGetSubmissions, 
  handleGetGlobalViolations 
} from "./routes/submissions.js";
import { handleGetProfile, handleUpdateProfile, handleChangePassword, handleUploadProfilePic } from "./routes/profile.js";
import { handleGetCourses } from "./routes/courses.js";
import { handleGetDepartments } from "./routes/departments.js";
import { handleLabControl } from "./routes/lab.js";
import { handleGetLoginLogs, handleGetActivityLogs } from "./routes/logs.js";
import { handleGetSettings, handleUpdateSettings } from "./routes/settings.js";
import { handleGetQuestions, handleCreateQuestion, handleDeleteQuestion } from "./routes/questions.js";
import { handleCreateViolation, handleGetViolations } from "./routes/violations.js";
import { handleRunCode, handleCheckCompilers } from "./routes/code.js";


import { authMiddleware, roleMiddleware } from "./middleware/auth.js";
import { initSocket } from "./socket.js";

// ─── Models (Eager Load) ───────────────────────────────────────────────────────
import "./models/User.js";
import "./models/Department.js";
import "./models/Course.js";
import "./models/Exam.js";
import "./models/Submission.js";
import "./models/QuestionBank.js";
import "./models/Device.js";
import "./models/Attendance.js";
import "./models/LoginLog.js";
import "./models/ActivityLog.js";
import "./models/Notification.js";
import "./models/Mark.js";
import "./models/LabSession.js";
import "./models/Lab.js";
import "./models/StudentProfile.js";
import "./models/Settings.js";
import "./models/Violation.js";

// ─── MongoDB Connection ────────────────────────────────────────────────────────
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️  MONGODB_URI not set.");
    return;
  }
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
      console.log("✅ MongoDB connected:", mongoose.connection.name, "Host:", mongoose.connection.host);
    }
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}

// Initial connection for standard start
connectDB();

// ─── API App ───────────────────────────────────────────────────────────────
export function createServer() {
  const app = express();
  console.log("🚀 Server reloaded - AI Assessment Engine v4 (Fully Integrated) Active");

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));


  // Security Headers & No-Cache Middleware
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Log all requests for debugging
  app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });

  // Profile Management (RESTORED)
  app.get("/api/profile", authMiddleware, handleGetProfile);
  app.put("/api/profile", authMiddleware, handleUpdateProfile);
  app.put("/api/profile/password", authMiddleware, handleChangePassword);
  app.post("/api/profile/upload", authMiddleware, handleUploadProfilePic);

  app.get("/api/ping", (req, res) => {
    res.json({ message: "pong", db: mongoose.connection.readyState });
  });


  app.get("/api/demo", handleDemo);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);
  
  // Users
  app.get("/api/users", authMiddleware, roleMiddleware(["admin", "hod"]), handleGetUsers);
  app.post("/api/users", authMiddleware, roleMiddleware(["admin", "hod"]), handleCreateUser);
  app.post("/api/users/bulk", authMiddleware, roleMiddleware(["admin", "hod"]), handleBulkUpload);
  app.get("/api/users/:id", authMiddleware, handleGetUserById);
  app.put("/api/users/:id", authMiddleware, handleUpdateUser);
  app.delete("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), handleDeleteUser);

  // Exams & Courses
  app.get("/api/exams", authMiddleware, handleGetExams);
  app.get("/api/exams/:id", authMiddleware, handleGetExamById);
  app.get("/api/courses", handleGetCourses);
  app.get("/api/questions", authMiddleware, roleMiddleware(["faculty", "hod", "admin"]), handleGetQuestions);
  app.post("/api/questions", authMiddleware, roleMiddleware(["faculty", "hod", "admin"]), handleCreateQuestion);
  app.delete("/api/questions/:id", authMiddleware, roleMiddleware(["faculty", "hod", "admin"]), handleDeleteQuestion);
  app.get("/api/departments", handleGetDepartments);
  
  // Hardware & Lab Control
  app.get("/api/devices", handleGetDevices);
  app.post("/api/devices/register", handleRegisterDevice);
  app.post("/api/devices/heartbeat", handleDeviceHeartbeat);
  app.post("/api/lab/control", authMiddleware, roleMiddleware(["admin", "hod", "faculty"]), handleLabControl);

  // Monitoring & Telemetry
  app.get("/api/exams-telemetry", authMiddleware, roleMiddleware(["admin", "hod", "faculty"]), handleGetSubmissions);
  app.get("/api/logs/violations", authMiddleware, roleMiddleware(["admin", "hod", "faculty"]), handleGetGlobalViolations);
  app.get("/api/logs/login", authMiddleware, roleMiddleware(["admin"]), handleGetLoginLogs);
  app.get("/api/logs/activity", authMiddleware, roleMiddleware(["admin"]), handleGetActivityLogs);
  app.post("/api/violations", authMiddleware, handleCreateViolation);
  app.get("/api/violations", authMiddleware, roleMiddleware(["admin", "hod", "faculty"]), handleGetViolations);


  app.get("/api/settings", handleGetSettings);
  app.put("/api/settings", authMiddleware, roleMiddleware(["admin"]), handleUpdateSettings);

  // Reports
  app.get("/api/reports/system", authMiddleware, roleMiddleware(["admin"]), handleGetSystemStats);
  app.get("/api/reports/faculty", authMiddleware, roleMiddleware(["faculty", "hod"]), handleGetFacultyStats);
  app.get("/api/reports/faculty/results", authMiddleware, roleMiddleware(["faculty", "hod"]), handleGetFacultyResults);
  app.get("/api/reports/faculty/monitoring", authMiddleware, roleMiddleware(["faculty", "hod"]), handleGetFacultyMonitoring);
  app.get("/api/reports/student", authMiddleware, roleMiddleware(["student"]), handleGetStudentStats);
  app.get("/api/reports/student/stats", authMiddleware, roleMiddleware(["student"]), handleGetStudentResults);

  // HOD Specializations
  app.get("/api/hod/stats", authMiddleware, roleMiddleware(["hod"]), handleGetHODStats);
  app.get("/api/hod/exams", authMiddleware, roleMiddleware(["hod"]), handleGetHODExams);
  app.get("/api/hod/faculty/status", authMiddleware, roleMiddleware(["hod"]), handleGetHODFacultyStatus);
  app.get("/api/hod/students/monitoring", authMiddleware, roleMiddleware(["hod"]), handleGetHODStudentsMonitoring);
  app.get("/api/hod/alerts", authMiddleware, roleMiddleware(["hod"]), handleGetHODAlerts);
  app.get("/api/hod/analytics", authMiddleware, roleMiddleware(["hod"]), handleGetHODAnalytics);
  app.post("/api/hod/faculty", authMiddleware, roleMiddleware(["hod"]), handleCreateHODFaculty);
  app.post("/api/hod/student", authMiddleware, roleMiddleware(["hod"]), handleCreateHODStudent);
  app.post("/api/hod/bulk", authMiddleware, roleMiddleware(["hod"]), handleHODBulkUpload);
  app.post("/api/hod/exams", authMiddleware, roleMiddleware(["hod", "faculty"]), handleCreateHODExam);

  // Submissions Lifecycle
  app.post("/api/submissions/start", authMiddleware, handleStartExam);
  app.put("/api/submissions/:id/answers", authMiddleware, handleUpdateAnswers);
  app.post("/api/submissions/:id/submit", authMiddleware, handleSubmitExam);
  app.post("/api/code/run", authMiddleware, handleRunCode);
  app.get("/api/code/check", handleCheckCompilers);


  // Question Bank
  app.get("/api/questions", authMiddleware, roleMiddleware(["hod", "faculty"]), handleGetQuestions);
  app.post("/api/questions", authMiddleware, roleMiddleware(["hod", "faculty"]), handleCreateQuestion);
  app.delete("/api/questions/:id", authMiddleware, roleMiddleware(["hod", "faculty"]), handleDeleteQuestion);


  return app;
}

export function setupSocket(httpServer, app) {
  const io = initSocket(httpServer);
  app.set("io", io);
  app.set("socketio", io);

  // Background Maintenance: Hardware Heartbeat Janitor (Runs every 30s)
  setInterval(async () => {
    try {
      const Device = mongoose.model("Device");
      const offlineThreshold = new Date(Date.now() - 60000); // 60 seconds
      
      const result = await Device.updateMany(
        { lastSeen: { $lt: offlineThreshold }, status: { $ne: "offline" } },
        { $set: { status: "offline" } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`🧹 Heartbeat Janitor: Decommissioned ${result.modifiedCount} inactive hardware nodes.`);
        io.to("admin-dashboard").emit("device-update-bulk");
      }
    } catch (err) {
      console.error("❌ Maintenance Error:", err.message);
    }
  }, 30000);

  return io;
}
