import mongoose from "mongoose";
import "dotenv/config";

// Force load models
import "./models/User.js";
import "./models/Department.js";
import "./models/Exam.js";
import "./models/Violation.js";

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/edulearn_lms";
  await mongoose.connect(uri);
  console.log("Connected to", uri);

  try {
    const User = mongoose.model("User");
    const Exam = mongoose.model("Exam");
    const Violation = mongoose.model("Violation");

    const student = await User.findOne({ role: "student" });
    const exam = await Exam.findOne();

    if (!student || !exam) {
      console.log("No student or exam found. Please seed them first.");
      process.exit(1);
    }

    const testViolation = new Violation({
      student: student._id,
      exam: exam._id,
      department: student.department || exam.department,
      type: "tab_switch",
      message: "MANUAL TEST LOG",
      screenshot: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      severity: "medium"
    });

    await testViolation.save();
    console.log("✅ Seed Violation Saved successfully!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
