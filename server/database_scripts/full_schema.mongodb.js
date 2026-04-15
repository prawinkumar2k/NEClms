/**
 * 🍃 LMS + Lab Control System: Production MongoDB Schema & Seed
 * This script defines indexes and sample data for complex entities.
 */

// 1. Departments
db.departments.insertMany([
  { _id: ObjectId("65f1a1a1a1a1a1a1a1a1a1a1"), name: "Computer Science", code: "CSE", description: "Standard engineering dept" },
  { _id: ObjectId("65f1a1a1a1a1a1a1a1a1a1a2"), name: "General Engineering", code: "GEN", description: "First year dept" }
]);

// 2. Users (Role-based)
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.insertMany([
  { 
    name: "System Admin", 
    email: "admin@lms.com", 
    password: "hashed_password", 
    role: "admin", 
    isActive: true, 
    isVerified: true 
  },
  { 
    name: "Dr. Rajesh", 
    email: "faculty@lms.com", 
    role: "faculty", 
    department: ObjectId("65f1a1a1a1a1a1a1a1a1a1a1"),
    isActive: true 
  }
]);

// 3. Exams (Embedded Questions approach)
db.exams.createIndex({ status: 1 });
db.exams.createIndex({ scheduledAt: 1 });
db.exams.insertOne({
  title: "Data Structures Mid-Term",
  course: ObjectId("65f1b1b1b1b1b1b1b1b1b1b1"),
  faculty: ObjectId("65f1c1c1c1c1c1c1c1c1c1c1"),
  questions: [
    {
      _id: ObjectId(),
      questionText: "What is the time complexity of binary search?",
      options: { A: "O(n)", B: "O(log n)", C: "O(n log n)", D: "O(1)" },
      correctAnswer: "B",
      marks: 1
    }
  ],
  duration: 60,
  scheduledAt: new Date("2024-05-15T10:00:00Z"),
  security: {
    disableCopyPaste: true,
    requireFullscreen: true,
    maxViolations: 3
  },
  status: "scheduled"
});

// 4. Submissions (Anti-Cheat Ready)
db.submissions.createIndex({ exam: 1, student: 1 }, { unique: true });
db.submissions.createIndex({ status: 1 });
db.submissions.insertOne({
  exam: ObjectId("..."),
  student: ObjectId("..."),
  device: ObjectId("..."),
  status: "in_progress",
  startedAt: new Date(),
  violations: [],
  totalViolations: 0
});

// 5. Devices (Lab Tracking)
db.devices.createIndex({ hostname: 1 }, { unique: true });
db.devices.createIndex({ status: 1 });
db.devices.insertMany([
  { hostname: "LAB-A-01", ip: "192.168.1.10", lab: "Lab A", status: "online" },
  { hostname: "LAB-A-02", ip: "192.168.1.11", lab: "Lab A", status: "offline" }
]);

// 6. Notifications
db.notifications.createIndex({ recipient: 1, createdAt: -1 });
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // Autoclean after 7 days

// 7. Activity Logs (Audit)
db.activitylogs.createIndex({ user: 1, action: 1 });
