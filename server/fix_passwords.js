import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";
import "./models/User.js";

async function fixPasswords() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const User = mongoose.model("User");
  
  const hash = await bcrypt.hash("password123", 12);
  const result = await User.updateMany(
    { password: "password123" },
    { $set: { password: hash } }
  );
  
  console.log(`Updated ${result.modifiedCount} users with real hashed passwords.`);
  process.exit(0);
}

fixPasswords();
