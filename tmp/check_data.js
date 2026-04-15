import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";
import "../server/models/Department.js";

async function checkData() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model("User");
  const Department = mongoose.model("Department");

  const hod = await User.findOne({ role: "hod" });
  console.log("HOD:", hod?.name, "Dept:", hod?.department);

  if (hod?.department) {
    const facultyCount = await User.countDocuments({ department: hod.department, role: "faculty" });
    const studentCount = await User.countDocuments({ department: hod.department, role: "student" });
    console.log("Faculty in Dept:", facultyCount);
    console.log("Students in Dept:", studentCount);
    
    // Check if department exists
    const dept = await Department.findById(hod.department);
    console.log("Department info:", dept?.name);
  } else {
    console.log("HOD has no department assigned!");
  }

  process.exit(0);
}

checkData();
