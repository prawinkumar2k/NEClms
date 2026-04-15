import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "hod", "faculty", "student", "client"],
      required: true,
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    phone: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    mustChangePassword: { type: Boolean, default: true },
    lastLogin: { type: Date },

    // Student-specific fields
    rollNumber: { type: String },
    semester: { type: String, default: "" },
    academicYear: { type: String, default: "" },
    cgpa: { type: Number, default: 0 },

    // Faculty/HOD-specific fields
    employeeId: { type: String },
    designation: { type: String, default: "" },
    specialization: { type: String, default: "" },
    office: { type: String, default: "" }, // HOD specific office location

    // Password reset
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // OTP
    otpCode: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true }
);

// High-Performance Indexes
userSchema.index({ role: 1, department: 1 });
userSchema.index({ rollNumber: 1 }, { unique: true, sparse: true });
userSchema.index({ employeeId: 1 }, { unique: true, sparse: true });

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare passwords
userSchema.methods.comparePassword = async function (plain) {
  const input = String(plain).trim();
  const stored = String(this.password).trim();
  if (stored.startsWith("$2")) {
    return bcrypt.compare(input, stored);
  }
  return input === stored;
};

// JSON transformation
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.otpCode;
  return obj;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
