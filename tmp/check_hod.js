import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";

async function checkHOD() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model("User");
  const hod = await User.findOne({ name: "Dr. Rajesh Kumar" });
  console.log("HOD Name:", hod?.name);
  console.log("HOD Dept ID:", hod?.department?.toString());
  
  if (hod?.department) {
    const counts = await Promise.all([
      User.countDocuments({ department: hod.department, role: "faculty" }),
      User.countDocuments({ department: hod.department, role: "student" })
    ]);
    console.log("Faculty count:", counts[0]);
    console.log("Student count:", counts[1]);
  }
  process.exit(0);
}
checkHOD();
