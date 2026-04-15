import mongoose from "mongoose";
import "dotenv/config";
import "./server/models/User.js";

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model("User");
  
  console.log("Cleaning up duplicate empty rollNumbers and employeeIds...");
  
  // Update all users where rollNumber is "" to be undefined
  const res1 = await User.updateMany(
    { rollNumber: "" },
    { $unset: { rollNumber: "" } }
  );
  console.log(`Unset rollNumber for ${res1.modifiedCount} users.`);

  // Update all users where employeeId is "" to be undefined
  const res2 = await User.updateMany(
    { employeeId: "" },
    { $unset: { employeeId: "" } }
  );
  console.log(`Unset employeeId for ${res2.modifiedCount} users.`);

  console.log("Cleanup complete.");
  process.exit(0);
}

fix();
