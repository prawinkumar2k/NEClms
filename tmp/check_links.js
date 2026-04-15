import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";
import "../server/models/Department.js";

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model("User");
  const Department = mongoose.model("Department");

  const depts = await Department.find({});
  const users = await User.find({});
  const hod = await User.findOne({name: "Dr. Rajesh Kumar"});

  console.log("🏙️ DEPARTMENTS:");
  depts.forEach(d => console.log(`- [${d._id}] ${d.name} (${d.code})`));

  console.log("\n👤 HOD DETAILS:");
  if (hod) {
    console.log(`- Name: ${hod.name}`);
    console.log(`- Linked Dept ID: ${hod.department}`);
  } else {
    console.log("- Dr. Rajesh Kumar NOT FOUND!");
  }

  console.log("\n👥 USERS COUNT BY DEPT:");
  const counts = await User.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } }
  ]);
  counts.forEach(c => {
    const dName = depts.find(d => d._id.toString() === c._id?.toString())?.name || "Unassigned";
    console.log(`- Dept [${c._id}] (${dName}): ${c.count} users`);
  });

  process.exit(0);
}

check();
