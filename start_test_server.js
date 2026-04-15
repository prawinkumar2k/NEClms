import { createServer, connectDB } from "./server/index.js";
import express from "express";

const start = async () => {
  try {
    await connectDB();
    const app = createServer();
    app.listen(8085, () => {
       console.log("TEST SERVER RUNNING ON 8085");
    });
  } catch (err) {
    console.error("CRASH:", err);
  }
};

start();
