import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "truth-desk";

if (!MONGO_URI) {
  throw new Error(
    "MONGO_URI environment variable is not set. Please add it to your .env.local file."
  );
}

// Simple connection like tiles-gallery (no complex TLS options needed)
let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development, preserve the client across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGO_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGO_URI);
  clientPromise = client.connect();
}

export async function getDb() {
  const c = await clientPromise;
  return c.db(DB_NAME);
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}

// Collection name constants
export const COLLECTIONS = {
  ARTICLES: "articles",
  CATEGORIES: "categories",
  ARTICLE_REVISIONS: "articleRevisions",
  EDITOR_COMMENTS: "editorComments",
  NOTIFICATIONS: "notifications",
  AUDIT_LOGS: "auditLogs",
};

export { clientPromise };
