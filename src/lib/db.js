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
  ASSIGNMENTS: "assignments",
  PITCHES: "pitches",
  INVITATIONS: "invitations",
  BREAKING_NEWS: "breakingNews",
  ARTICLE_VIEWS: "articleViews",
};

export async function initDbIndexes() {
  const db = await getDb();
  
  // articles
  await db.collection(COLLECTIONS.ARTICLES).createIndex({ status: 1, createdAt: -1 });
  await db.collection(COLLECTIONS.ARTICLES).createIndex({ authorId: 1, status: 1 });
  await db.collection(COLLECTIONS.ARTICLES).createIndex({ categoryId: 1, status: 1 });
  await db.collection(COLLECTIONS.ARTICLES).createIndex({ "workflow.publishedAt": -1 });
  await db.collection(COLLECTIONS.ARTICLES).createIndex({ slug: 1 }, { unique: true });
  await db.collection(COLLECTIONS.ARTICLES).createIndex({ "editorial.topNews": 1 });

  // notifications  
  await db.collection(COLLECTIONS.NOTIFICATIONS).createIndex({ userId: 1, read: 1, createdAt: -1 });

  // assignments
  await db.collection(COLLECTIONS.ASSIGNMENTS).createIndex({ journalistId: 1, status: 1 });
  await db.collection(COLLECTIONS.ASSIGNMENTS).createIndex({ editorId: 1, status: 1 });

  // pitches
  await db.collection(COLLECTIONS.PITCHES).createIndex({ journalistId: 1, status: 1 });

  // invitations
  await db.collection(COLLECTIONS.INVITATIONS).createIndex({ tokenHash: 1 }, { unique: true });
  await db.collection(COLLECTIONS.INVITATIONS).createIndex({ email: 1 });
  await db.collection(COLLECTIONS.INVITATIONS).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  // breakingNews
  await db.collection(COLLECTIONS.BREAKING_NEWS).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection(COLLECTIONS.BREAKING_NEWS).createIndex({ createdAt: -1 });

  // articleViews (for dedup by sessionId + articleId)
  await db.collection(COLLECTIONS.ARTICLE_VIEWS).createIndex({ articleId: 1, sessionId: 1 }, { unique: true });
  await db.collection(COLLECTIONS.ARTICLE_VIEWS).createIndex({ articleId: 1 });
  await db.collection(COLLECTIONS.ARTICLE_VIEWS).createIndex({ viewedAt: 1 });

  console.log("Database indexes initialized.");
}

export { clientPromise };
