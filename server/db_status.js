import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/edulearn_lms";

async function verify() {
  await mongoose.connect(MONGO_URI);
  const colls = await mongoose.connection.db.listCollections().toArray();
  console.log("\n📦 EduLearn LMS — Database Status");
  console.log("═".repeat(40));
  for (const c of colls) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`  ${c.name.padEnd(20)} → ${count}`);
  }
  console.log("═".repeat(40));
  await mongoose.disconnect();
}
verify().catch(e => console.error(e.message));
