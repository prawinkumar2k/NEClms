import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcryptjs";

// Import your model directly or define it if the build system is tricky
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

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const email = "admin@university.edu";
    const password = "password123";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = new User({
      name: "System Administrator",
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
      isVerified: true,
      mustChangePassword: false
    });

    await admin.save();
    console.log("-----------------------------------------");
    console.log("✅ Admin User Created Successfully!");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log("-----------------------------------------");
    
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err.message);
    process.exit(1);
  }
}

createAdmin();
