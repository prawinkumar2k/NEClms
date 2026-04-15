import mongoose from "mongoose";
import "dotenv/config";
import "../server/models/User.js";
import "../server/models/Submission.js";
import "../server/models/Device.js";

async function purgeDirtyData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model("User");
    const Submission = mongoose.model("Submission");
    const Device = mongoose.model("Device");

    // Delete users with generic names
    const result = await User.deleteMany({ 
        name: { $regex: /Student \d|Faculty \d|Professor \d|Teacher \d/i } 
    });
    console.log(`🧹 Purged ${result.deletedCount} generic users.`);

    // Delete submissions without student or exam info
    const subResult = await Submission.deleteMany({
        $or: [
            { student: null },
            { exam: null }
        ]
    });
    console.log(`🧹 Purged ${subResult.deletedCount} orphans/dummy submissions.`);

    // Also purge submissions by non-existent students
    const allUsers = await User.find({}).distinct("_id");
    const subResult2 = await Submission.deleteMany({
        student: { $nin: allUsers }
    });
    console.log(`🧹 Purged ${subResult2.deletedCount} submissions from deleted users.`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
purgeDirtyData();
