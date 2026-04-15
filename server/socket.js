import { Server } from "socket.io";
import mongoose from "mongoose";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🔌 New socket connection:", socket.id);

    socket.on("join-dashboard", () => {
      socket.join("admin-dashboard");
      console.log(`👤 Socket ${socket.id} joined admin-dashboard`);
    });

    const lastScreenUpdate = new Map();

    // ─── Live Screen Monitoring ───────────────────────────────────────────────
    socket.on("join-exam-room-monitoring", (examId) => {
      console.log(`📡 MONITOR-JOIN: Socket ${socket.id} joining monitoring-${examId}`);
      socket.join(`monitoring-${examId}`);
      
      // Check room size for debugging
      const room = io.sockets.adapter.rooms.get(`monitoring-${examId}`);
      console.log(`📊 Room [monitoring-${examId}] members: ${room ? room.size : 0}`);
    });

    socket.on("screen-data", ({ examId, frame, studentId, studentName, studentRoll, violationCount }) => {
      if (!examId || !frame) return;

      // Rate limit to prevent network congestion (max 1 frame per 2.5s)
      const now = Date.now();
      if (lastScreenUpdate.has(socket.id) && now - lastScreenUpdate.get(socket.id) < 2500) return;
      lastScreenUpdate.set(socket.id, now);

      console.log(`🛰️ BROADCAST [${examId}]: From ${studentName} to monitor-room (V: ${violationCount})`);
      
      // Send to the monitoring room for this specific exam
      io.to(`monitoring-${examId}`).emit("screen-update", {
        studentId,
        studentName,
        studentRoll,
        frame,
        violationCount,
        lastUpdate: new Date().toISOString()
      });
    });

    // Device Management
    socket.on("device-connect", async (deviceId) => {
      try {
        const Device = mongoose.model("Device");
        const device = await Device.findOne({ $or: [{ deviceId }, { hostname: deviceId }] });
        
        if (device) {
          console.log(`💻 Node [${device.hostname}] linked to Authority Room: device-${device._id}`);
          socket.join(`device-${device._id}`);
          
          // Force status update
          device.status = "online";
          device.lastSeen = new Date();
          await device.save();
          
          io.to("admin-dashboard").emit("device-update", device);
        }
      } catch (err) {
        console.error("Socket device-connect error:", err.message);
      }
    });

    socket.on("send-command", ({ targetIds, command, payload }) => {
      console.log(`📡 Dispatching command: ${command} to ${targetIds.length} nodes`);
      targetIds.forEach(id => {
        io.to(`device-${id}`).emit("receive-command", { command, payload });
      });
    });

    socket.on("disconnect", () => {
      if (socket.deviceId) {
        console.log(`👋 Device ${socket.deviceId} disconnected`);
        updateDeviceConnectivity(socket.deviceId, "offline");
      }
      console.log("👋 Socket disconnected:", socket.id);
    });
  });

  return io;
};

const updateDeviceConnectivity = async (deviceId, status) => {
  try {
    const Device = mongoose.model("Device");
    const device = await Device.findOneAndUpdate(
      { deviceId },
      { status, lastSeen: new Date() },
      { new: true }
    );
    if (device && io) {
      io.to("admin-dashboard").emit("device-update", device);
      broadcastSystemStats();
    }
  } catch (err) {
    console.error("❌ Device connectivity update failed:", err.message);
  }
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

// ─── Real-time broadcast helpers ─────────────────────────────────────────────

export const notifyViolation = (violation) => {
  if (io) {
    io.to("admin-dashboard").emit("new-violation", violation);
  }
};

export const notifyActivity = (activity) => {
  if (io) {
    io.to("admin-dashboard").emit("new-activity", activity);
  }
};

export const updateDeviceStatus = (deviceId, status) => {
  if (io) {
    io.to("admin-dashboard").emit("device-update", { deviceId, status });
  }
};

export const broadcastSystemStats = async () => {
  if (!io) return;
  try {
    const User = mongoose.model("User");
    const Exam = mongoose.model("Exam");
    const Device = mongoose.model("Device");
    const Submission = mongoose.model("Submission");

    const [
      students, faculty, devices, online, activeExams, violationsToday
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      Device.countDocuments(),
      Device.countDocuments({ status: "online" }),
      Exam.countDocuments({ status: "active" }),
      Submission.countDocuments({ 
        "violations.timestamp": { $gte: new Date().setHours(0,0,0,0) } 
      })
    ]);

    io.to("admin-dashboard").emit("stats-update", {
      students, faculty, devices, online, activeExams, violationsToday
    });
  } catch (err) {
    console.error("❌ Socket broadcast error:", err.message);
  }
};
