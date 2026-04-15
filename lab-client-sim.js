const io = require("socket.io-client");
const axios = require("axios");

// CONFIGURATION
const SERVER_URL = "http://localhost:8080";
const DEVICE_ID = "LT-01"; // Change based on your hardware ID

console.log(`🚀 Initializing Lab PC Client: ${DEVICE_ID}`);

const socket = io(SERVER_URL);

socket.on("connect", () => {
    console.log("🔌 Connected to Lab Control Server");
    // Handshake: Join the control room for this device
    socket.emit("device-connect", DEVICE_ID);
});

socket.on("receive-command", ({ command, payload }) => {
    console.log(`📡 RECEIVED COMMAND: [${command}]`);
    
    switch(command) {
        case "lock_all":
        case "lock":
            console.log("🔒 ACTION: Locking screen...");
            break;
        case "unlock_all":
        case "unlock":
            console.log("🔓 ACTION: Unlocking screen...");
            break;
        case "exam_mode":
            console.log("📝 ACTION: Initiating Exam Security Layer...");
            break;
        case "restart_all":
            console.log("🔄 ACTION: System rebooting in 10s...");
            break;
        default:
            console.log("❓ Unknown command received");
    }
});

// Periodic Heartbeat (Every 5 seconds as requested)
setInterval(async () => {
    try {
        await axios.post(`${SERVER_URL}/api/devices/heartbeat`, {
            deviceId: DEVICE_ID,
            status: "online"
        });
        console.log("💓 Heartbeat synced");
    } catch (err) {
        console.error("❌ Heartbeat failed:", err.message);
    }
}, 5000);

socket.on("disconnect", () => {
    console.log("👋 Disconnected from server");
});
