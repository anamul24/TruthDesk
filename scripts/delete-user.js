/**
 * Delete User Script
 *
 * Usage: MONGO_URI=... node scripts/delete-user.js <email1> <email2> ...
 *
 * Or via npm:
 *   node scripts/delete-user.js testuser@gmail.com
 *   (set MONGO_URI in your shell first, or it reads from process.env)
 *
 * Examples:
 *   node scripts/delete-user.js editor@gmail.com
 *   node scripts/delete-user.js test1@test.com test2@test.com
 */

import { MongoClient } from "mongodb";

// Reads MONGO_URI from environment (set it before running, or hardcode for dev)
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://anamdb:fbzmais311024@cluster0.mah9l7v.mongodb.net/?appName=Cluster0";

const DB_NAME = "truth-desk";

const emails = process.argv.slice(2);

if (emails.length === 0) {
  console.error("\nUsage: node scripts/delete-user.js <email1> [email2 ...]");
  console.error("Example: node scripts/delete-user.js test@test.com\n");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const usersCollection = db.collection("user");
    const accountCollection = db.collection("account");
    const sessionCollection = db.collection("session");

    for (const email of emails) {
      const emailLower = email.toLowerCase();
      
      const user = await usersCollection.findOne({ email: emailLower });
      
      if (!user) {
        console.log(`✗ No user found with email: ${emailLower}`);
        continue;
      }
      
      const userId = user._id; // String ID in Better Auth usually

      // Delete user
      await usersCollection.deleteOne({ _id: userId });
      // Delete accounts
      await accountCollection.deleteMany({ userId: userId.toString() });
      // Delete sessions
      await sessionCollection.deleteMany({ userId: userId.toString() });

      console.log(`✓ Deleted user: ${emailLower} (Name: ${user.name})`);
    }

    console.log("\nCurrent users in database:");
    const allUsers = await usersCollection
      .find({}, { projection: { email: 1, name: 1, role: 1 } })
      .toArray();

    if (allUsers.length > 0) {
      allUsers.forEach((u) => {
        console.log(
          `  - ${u.email}  (name: ${u.name})  role: ${u.role || "journalist"}`
        );
      });
    } else {
      console.log("  No users left.");
    }
    console.log("");
  } catch (error) {
    console.error("Script failed:", error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
