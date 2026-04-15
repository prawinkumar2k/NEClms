/**
 * EduLearn LMS — Database Import Script
 * Imports all JSON files from ./db_export/ into MongoDB
 * Run: node scripts/import_db.mjs
 *
 * OPTIONS:
 *   --wipe     Wipe each collection before importing (default: false)
 *   --uri      Override MongoDB URI (e.g. --uri=mongodb://localhost:27017/edulearn_lms)
 */

import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.join(__dirname, "..", "db_export");

// Parse CLI args
const args = process.argv.slice(2);
const wipe = args.includes("--wipe");
const uriArg = args.find((a) => a.startsWith("--uri="));
const MONGO_URI =
  (uriArg ? uriArg.split("=")[1] : null) ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/edulearn_lms";

async function importDB() {
  console.log("\n📥  EduLearn LMS — Database Import");
  console.log("=====================================");
  console.log("Connecting to:", MONGO_URI);
  if (wipe) console.log("⚠️   --wipe flag set: existing data will be cleared");

  if (!fs.existsSync(EXPORT_DIR)) {
    console.error("❌  db_export/ directory not found. Run export_db.mjs first.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("✅  Connected to MongoDB\n");

  const db = mongoose.connection.db;

  // Read metadata
  const metaPath = path.join(EXPORT_DIR, "_metadata.json");
  const metadata = fs.existsSync(metaPath)
    ? JSON.parse(fs.readFileSync(metaPath, "utf-8"))
    : null;

  if (metadata) {
    console.log(`📅  Export date: ${metadata.exportedAt}`);
    console.log(`🗄️   Source DB:   ${metadata.dbName}\n`);
  }

  // Find all JSON files (skip metadata)
  const files = fs
    .readdirSync(EXPORT_DIR)
    .filter((f) => f.endsWith(".json") && f !== "_metadata.json");

  let totalImported = 0;

  for (const file of files) {
    const colName = path.basename(file, ".json");
    const filePath = path.join(EXPORT_DIR, file);
    const docs = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (docs.length === 0) {
      console.log(`  ⏭️   ${colName}: 0 documents (skipped)`);
      continue;
    }

    if (wipe) {
      await db.collection(colName).deleteMany({});
    }

    try {
      const result = await db.collection(colName).insertMany(docs, {
        ordered: false, // continue on duplicate key errors
      });
      console.log(`  ✅  ${colName}: ${result.insertedCount} documents imported`);
      totalImported += result.insertedCount;
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate key – some docs may have been inserted
        const inserted = err.result?.nInserted || 0;
        console.log(
          `  ⚠️   ${colName}: ${inserted} inserted (some duplicates skipped)`
        );
        totalImported += inserted;
      } else {
        console.error(`  ❌  ${colName}: ${err.message}`);
      }
    }
  }

  console.log(`\n✅  Import complete! Total documents imported: ${totalImported}`);
  console.log("\n💡  Next steps:");
  console.log("     1. Start the server: pnpm dev");
  console.log("     2. Login with seeded admin credentials from SETUP_GUIDE.md\n");

  await mongoose.disconnect();
}

importDB().catch((err) => {
  console.error("❌  Import failed:", err.message);
  process.exit(1);
});
