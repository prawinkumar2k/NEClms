import mongoose from "mongoose";
import "dotenv/config";
import "./models/User.js";
import "./models/Department.js";

async function createTargetUser() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const User = mongoose.model("User");
  const Department = mongoose.model("Department");
  
  // Get AIDS dept
  let aidsDept = await Department.findOne({ name: "Artificial Intelligence and Data Science" });
  if (!aidsDept) {
     aidsDept = await Department.create({ name: "Artificial Intelligence and Data Science", code: "AIDS" });
  }

  // Create student1@nec.edu
  const student = await User.findOneAndUpdate(
    { email: "student1@nec.edu" },
    {
      name: "Student 1",
      email: "student1@nec.edu",
      password: "password123", // Will be hashed by pre-save
      role: "student",
      department: aidsDept._id,
      rollNumber: "NEC21AD01",
      isActive: true,
      mustChangePassword: false
    },
    { upsert: true, new: true }
  );
  
  console.log("SUCCESS: User student1@nec.edu is now LIVE in the database.");
  console.log("Password set to: password123");
  process.exit(0);
}

createTargetUser();
