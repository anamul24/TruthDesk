/**
 * Seed Admin Script
 *
 * Usage: node scripts/seed-admin.js <email>
 *
 * Promotes an existing Better Auth user to admin role by email.
 * The user must already be registered in the system.
 */

import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "truth-desk";

const email = process.argv[2];

if (!email) {
  console.error("Usage: MONGO_URI=... node scripts/seed-admin.js <email>");
  console.error("Example: MONGO_URI=mongodb://localhost:27017 node scripts/seed-admin.js admin@truthdesk.com");
  process.exit(1);
}

if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI environment variable not set.");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const users = db.collection("user"); // Better Auth uses "user" collection

    // Find the user
    const user = await users.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`✗ User not found with email: ${email}`);
      console.error("  Make sure the user has registered first.");
      process.exit(1);
    }

    // Update role
    const result = await users.updateOne(
      { _id: user._id },
      { $set: { role: "admin" } }
    );

    if (result.modifiedCount === 1) {
      console.log(`✓ User "${user.name}" (${email}) promoted to admin`);
    } else if (user.role === "admin") {
      console.log(`⚠ User "${user.name}" (${email}) is already an admin`);
    } else {
      console.error("✗ Failed to update user role");
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
