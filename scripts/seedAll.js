import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "hod", "faculty", "student"], required: true },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  mustChangePassword: { type: Boolean, default: false }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Seeding.");

    const users = [
      { name: "HOD User", email: "hod@university.edu", role: "hod" },
      { name: "Faculty User", email: "faculty@university.edu", role: "faculty" },
      { name: "Student User", email: "student@university.edu", role: "student" }
    ];

    for (const u of users) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`Skipping: ${u.role} already exists.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash("password123", 12);
      await User.create({
        ...u,
        password: hashedPassword,
        isActive: true,
        isVerified: true
      });
      console.log(`✅ Created ${u.role}: ${u.email}`);
    }

    console.log("Seeding Completed.");
    process.exit(0);
  } catch (err) {
    console.error("Seed Error:", err.message);
    process.exit(1);
  }
}

seedUsers();
