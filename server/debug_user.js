import mongoose from "mongoose";
import "dotenv/config";
import "./models/User.js";

async function checkUser() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const User = mongoose.model("User");
  
  const user = await User.findOne({ email: "student1@nec.edu" }).select("+password");
  if (user) {
    console.log("User found!");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Password Length:", user.password.length);
    console.log("Starts with $2b$:", user.password.startsWith("$2b$"));
    console.log("Password hash (first 10 chars):", user.password.substring(0, 10));
  } else {
    console.log("User NOT found in database!");
    const allUsers = await User.find({}, 'email').limit(5);
    console.log("Sample users in DB:", allUsers.map(u => u.email));
  }
  process.exit(0);
}

checkUser();
