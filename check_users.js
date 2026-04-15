import mongoose from "mongoose";
import "dotenv/config";
import "./server/models/User.js";

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model("User");
  const users = await User.find({}, "email role").lean();
  console.log("EMAILS IN DB:");
  users.forEach(u => console.log(`- ${u.email} (${u.role})`));
  process.exit(0);
}

check();
