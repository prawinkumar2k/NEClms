/**
 * EduLearn LMS — Database Export Script
 * Exports all MongoDB collections to JSON files in ./db_export/
 * Run: node scripts/export_db.mjs
 */

import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/edulearn_lms";
const EXPORT_DIR = path.join(__dirname, "..", "db_export");

async function exportDB() {
  console.log("\n📦  EduLearn LMS — Database Export");
  console.log("=====================================");
  console.log("Connecting to:", MONGO_URI);

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("✅  Connected to MongoDB\n");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  // Create export directory
  if (fs.existsSync(EXPORT_DIR)) {
    fs.rmSync(EXPORT_DIR, { recursive: true });
  }
  fs.mkdirSync(EXPORT_DIR, { recursive: true });

  // Write metadata
  const metadata = {
    exportedAt: new Date().toISOString(),
    mongoUri: MONGO_URI.replace(/:\/\/.*@/, "://<credentials>@"), // mask credentials
    dbName: "edulearn_lms",
    collections: {},
  };

  for (const col of collections) {
    const name = col.name;
    const docs = await db.collection(name).find({}).toArray();
    const filePath = path.join(EXPORT_DIR, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
    metadata.collections[name] = docs.length;
    console.log(`  ✅  ${name}: ${docs.length} documents → ${name}.json`);
  }

  fs.writeFileSync(
    path.join(EXPORT_DIR, "_metadata.json"),
    JSON.stringify(metadata, null, 2)
  );

  console.log(`\n✅  Export complete! Files saved to: db_export/`);
  console.log("📊  Summary:");
  for (const [col, count] of Object.entries(metadata.collections)) {
    console.log(`     ${col}: ${count} docs`);
  }
  console.log("\n💡  To restore on another machine, run:");
  console.log("     node scripts/import_db.mjs\n");

  await mongoose.disconnect();
}

exportDB().catch((err) => {
  console.error("❌  Export failed:", err.message);
  process.exit(1);
});
