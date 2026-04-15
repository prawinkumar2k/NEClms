import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_keep_it_safe";

export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const User = mongoose.model("User");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");
    
    // Log failures
    if (!user) {
      await mongoose.model("LoginLog").create({
        email,
        status: "failed",
        failReason: "user_not_found",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await mongoose.model("LoginLog").create({
        user: user._id,
        email,
        status: "failed",
        failReason: "wrong_password",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    // Success log
    await mongoose.model("LoginLog").create({
      user: user._id,
      email,
      role: user.role,
      status: "success",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    // Generate real JWT
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, dept: user.department },
      JWT_SECRET,
      { expiresIn: "24h" }
    );


    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        profilePic: user.profilePic,
        mustChangePassword: user.mustChangePassword
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleLogout = (req, res) => {
  res.json({ message: "Logged out successfully" });
};
