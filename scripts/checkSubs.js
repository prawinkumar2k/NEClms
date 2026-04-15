import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";
import "../server/models/Exam.js";
import "../server/models/Submission.js";

async function checkSubmissions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Submission = mongoose.model("Submission");
    const subs = await Submission.find({}).populate("student").populate("exam");
    console.log("Found", subs.length, "submissions.");
    subs.forEach(s => {
      console.log(`- Student: ${s.student?.name}, Role: ${s.student?.role}, Exam: ${s.exam?.title}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkSubmissions();
