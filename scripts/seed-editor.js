/**
 * Seed Editor Account Script
 *
 * Usage: node scripts/seed-editor.js
 *
 * This script creates a default editor account in the database.
 * Run this once to set up the editor credentials.
 *
 * Default credentials:
 *   Email:    editor@truthdesk.com
 *   Password: Editor@1234
 */

import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://anamdb:fbzmais311024@cluster0.mah9l7v.mongodb.net/?appName=Cluster0";

const DB_NAME = "truth-desk";

// Better Auth uses scrypt for password hashing
// We'll use a compatible approach
async function hashPassword(password) {
  // Better Auth uses scrypt internally. We call their API endpoint instead.
  // Since we can't easily replicate their exact hash, we'll use the Better Auth
  // API to create the user properly via HTTP.
  return null; // signals to use API method
}

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const usersCollection = db.collection("user");
    const accountsCollection = db.collection("account");

    // Check if editor already exists
    const existingEditor = await usersCollection.findOne({
      email: "editor@truthdesk.com",
    });

    if (existingEditor) {
      console.log("✓ Editor account already exists:");
      console.log("  Email:", existingEditor.email);
      console.log("  Role:", existingEditor.role);
      console.log("  Name:", existingEditor.name);

      // Make sure role is editor
      if (existingEditor.role !== "editor") {
        await usersCollection.updateOne(
          { email: "editor@truthdesk.com" },
          { $set: { role: "editor", updatedAt: new Date() } }
        );
        console.log("  ✓ Updated role to 'editor'");
      }
      return;
    }

    // --- Check if there's any user with role=editor and update ---
    const anyEditor = await usersCollection.findOne({ role: "editor" });
    if (anyEditor) {
      console.log("✓ Found existing editor account:");
      console.log("  Email:", anyEditor.email);
      console.log("  Role:", anyEditor.role);
      console.log("  Name:", anyEditor.name);
      console.log("\nNo action needed. Use the above credentials to login.");
      return;
    }

    console.log("\n⚠ No editor account found.");
    console.log("Please create one via the Better Auth API:");
    console.log("\n  Option 1 - Register via app then update role:");
    console.log("    1. Go to http://localhost:3000/register");
    console.log("    2. Register with: editor@truthdesk.com / Editor@1234");
    console.log("    3. Then run: node scripts/set-editor-role.js");
    console.log("\n  Option 2 - Use Admin Dashboard:");
    console.log("    Login as admin and change role from user management.");
    console.log(
      "\nRunning automatic role update for any matching email in DB..."
    );

    // Try to find any user registered with editor email and set their role
    const matchByEmail = await usersCollection.findOne({
      email: "editor@truthdesk.com",
    });
    if (matchByEmail) {
      await usersCollection.updateOne(
        { email: "editor@truthdesk.com" },
        { $set: { role: "editor", updatedAt: new Date() } }
      );
      console.log("✓ Set role to editor for editor@truthdesk.com");
    } else {
      console.log(
        "\nℹ No user found with editor@truthdesk.com. Register first."
      );
    }
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
