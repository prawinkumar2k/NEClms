import { getIO } from "../socket.js";

export const handleLabControl = async (req, res) => {
  try {
    const { command, targetIds, payload } = req.body;
    
    if (!command || !targetIds) {
      return res.status(400).json({ message: "Invalid command request" });
    }

    const io = getIO();
    console.log(`📡 Broadcast: [${command}] to ${targetIds.length} devices`);

    // Emit via socket room
    targetIds.forEach(id => {
      io.to(`device-${id}`).emit("receive-command", { command, payload });
    });

    res.json({ message: `Command ${command} sent to ${targetIds.length} systems.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
