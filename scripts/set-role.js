/**
 * Set User Role Script
 *
 * Usage: MONGO_URI=... node scripts/set-role.js <email> <role>
 *
 * Or via npm:
 *   npm run set-role -- editor@gmail.com editor
 *   (set MONGO_URI in your shell first, or it reads from process.env)
 *
 * Examples:
 *   node scripts/set-role.js editor@gmail.com editor
 *   node scripts/set-role.js journalist@gmail.com journalist
 *   node scripts/set-role.js admin@gmail.com admin
 *
 * Valid roles: journalist, editor, admin, fact_checker
 */

import { MongoClient } from "mongodb";

// Reads MONGO_URI from environment (set it before running, or hardcode for dev)
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://anamdb:fbzmais311024@cluster0.mah9l7v.mongodb.net/?appName=Cluster0";

const DB_NAME = "truth-desk";
const VALID_ROLES = ["journalist", "editor", "admin", "fact_checker"];

const [, , email, role] = process.argv;

if (!email || !role) {
  console.error("\nUsage: node scripts/set-role.js <email> <role>");
  console.error("Example: node scripts/set-role.js editor@gmail.com editor\n");
  process.exit(1);
}

if (!VALID_ROLES.includes(role)) {
  console.error(`\nInvalid role: "${role}"`);
  console.error(`Valid roles: ${VALID_ROLES.join(", ")}\n`);
  process.exit(1);
}

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const usersCollection = db.collection("user"); // Better Auth collection name

    // Find user by email (case-insensitive)
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      console.error(`\n✗ No user found with email: ${email}`);
      console.error(
        "  → Please register first at http://localhost:3000/register\n"
      );

      // List all existing users for reference
      const allUsers = await usersCollection
        .find({}, { projection: { email: 1, name: 1, role: 1 } })
        .toArray();

      if (allUsers.length > 0) {
        console.log("Existing users in database:");
        allUsers.forEach((u) => {
          console.log(
            `  - ${u.email}  (name: ${u.name})  role: ${u.role || "journalist"}`
          );
        });
        console.log("");
      }
      return;
    }

    const oldRole = user.role || "journalist";

    if (oldRole === role) {
      console.log(`\nℹ "${user.name}" (${email}) already has role: ${role}\n`);
      return;
    }

    // Update role
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { role, updatedAt: new Date() } }
    );

    console.log(`\n✓ Role updated for: ${email}`);
    console.log(`  Name : ${user.name}`);
    console.log(`  Role : ${oldRole}  →  ${role}`);

    if (role === "editor") {
      console.log(
        "\n✓ Now login at http://localhost:3000/login with this email"
      );
      console.log("  → Will redirect to: /editor  (Editor Dashboard)");
    } else if (role === "journalist") {
      console.log(
        "\n✓ Now login at http://localhost:3000/login with this email"
      );
      console.log("  → Will redirect to: /journalist  (Journalist Dashboard)");
    } else if (role === "admin") {
      console.log(
        "\n✓ Now login at http://localhost:3000/login with this email"
      );
      console.log("  → Will redirect to: /admin  (Admin Dashboard)");
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
