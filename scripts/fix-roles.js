// Bulk update: change all users with role='user' to role='journalist'
import { MongoClient } from "mongodb";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://anamdb:fbzmais311024@cluster0.mah9l7v.mongodb.net/?appName=Cluster0";

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log("✓ Connected to MongoDB");
    const db = client.db("truth-desk");
    const users = db.collection("user");

    // Show current state
    const all = await users
      .find({}, { projection: { email: 1, name: 1, role: 1 } })
      .toArray();
    console.log("\nCurrent users:");
    all.forEach((u) =>
      console.log(`  ${u.email} | ${u.name} | role: ${u.role || "—"}`)
    );

    // Update all 'user' roles → 'journalist'
    const result = await users.updateMany(
      { role: "user" },
      { $set: { role: "journalist", updatedAt: new Date() } }
    );
    console.log(
      `\n✓ Updated ${result.modifiedCount} users: role=user → role=journalist`
    );

    // Final state
    const updated = await users
      .find({}, { projection: { email: 1, name: 1, role: 1 } })
      .toArray();
    console.log("\nFinal users:");
    updated.forEach((u) =>
      console.log(`  ${u.email} | ${u.name} | role: ${u.role}`)
    );
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
