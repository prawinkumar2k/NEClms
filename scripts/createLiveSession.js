import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";
import "../server/models/Exam.js";
import "../server/models/Submission.js";
import "../server/models/Device.js";

async function createLiveSession() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model("User");
    const Exam = mongoose.model("Exam");
    const Submission = mongoose.model("Submission");
    const Device = mongoose.model("Device");

    const student = await User.findOne({ email: "student@university.edu" });
    const exam = await Exam.findOne({ title: "MERN Midterm Exam" });
    const pc = await Device.findOne({ deviceId: "LAB-PC-1" });

    if (!student || !exam || !pc) {
      console.error("Missing seed data. Run ultimateSeed first.");
      process.exit(1);
    }

    await Submission.findOneAndUpdate(
      { student: student._id, exam: exam._id },
      {
        device: pc._id,
        status: "in_progress",
        startedAt: new Date(),
        totalViolations: 2,
        violations: [
          { type: "tab_switch", timestamp: new Date() },
          { type: "right_click", timestamp: new Date() }
        ],
        answers: { 0: "A" }
      },
      { upsert: true, new: true }
    );

    console.log("✅ Created a LIVE SESSION for John Student.");
    console.log("Dashboards should now reflect this real-time data.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
createLiveSession();
