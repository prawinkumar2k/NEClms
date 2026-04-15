import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const handleGetProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("department");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const handleUpdateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      "name", "phone", "profilePic", 
      "semester", "academicYear", "cgpa",
      "designation", "specialization", "office"
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });


    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const handleChangePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: "Invalid old password" });

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const handleUploadProfilePic = async (req, res) => {
  try {
    const { image } = req.body; // Expecting base64 for simplicity in this lab environment
    await User.findByIdAndUpdate(req.user.id, { profilePic: image });
    res.json({ message: "Profile image updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
