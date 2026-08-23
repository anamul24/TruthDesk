/**
 * Migration & Seed Script
 *
 * Usage: node scripts/migrate-seed.js
 *
 * This script:
 * 1. Creates MongoDB indexes for optimal query performance
 * 2. Seeds categories from existing JSON data
 * 3. Migrates existing JSON articles into the new article model format
 */

import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "truth-desk";

if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI environment variable not set.");
  console.error("Set it in .env.local or pass it directly:");
  console.error("  MONGO_URI=mongodb://... node scripts/migrate-seed.js");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB");

    const db = client.db(DB_NAME);

    // 1. Create indexes
    console.log("\n--- Creating Indexes ---");
    await createIndexes(db);

    // 2. Seed categories
    console.log("\n--- Seeding Categories ---");
    await seedCategories(db);

    // 3. Migrate articles
    console.log("\n--- Migrating Articles ---");
    await migrateArticles(db);

    console.log("\n✓ Migration complete!\n");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

async function createIndexes(db) {
  // Articles indexes
  const articles = db.collection("articles");
  await articles.createIndex({ status: 1 });
  await articles.createIndex({ slug: 1 }, { unique: true });
  await articles.createIndex({ authorId: 1 });
  await articles.createIndex({ categoryId: 1 });
  await articles.createIndex({ status: 1, createdAt: -1 });
  await articles.createIndex({ "editorial.featured": 1 });
  await articles.createIndex({ "editorial.trending": 1 });
  await articles.createIndex({ "editorial.todaysPick": 1 });
  console.log("  ✓ Articles indexes created");

  // Categories indexes
  const categories = db.collection("categories");
  await categories.createIndex({ slug: 1 }, { unique: true });
  console.log("  ✓ Categories indexes created");

  // Article revisions indexes
  const revisions = db.collection("articleRevisions");
  await revisions.createIndex({ articleId: 1, version: -1 });
  console.log("  ✓ Article revisions indexes created");

  // Editor comments indexes
  const comments = db.collection("editorComments");
  await comments.createIndex({ articleId: 1, createdAt: -1 });
  console.log("  ✓ Editor comments indexes created");

  // Notifications indexes
  const notifications = db.collection("notifications");
  await notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });
  console.log("  ✓ Notifications indexes created");

  // Audit logs indexes
  const auditLogs = db.collection("auditLogs");
  await auditLogs.createIndex({ timestamp: -1 });
  await auditLogs.createIndex({ articleId: 1, timestamp: -1 });
  await auditLogs.createIndex({ userId: 1, timestamp: -1 });
  console.log("  ✓ Audit logs indexes created");
}

async function seedCategories(db) {
  const mockDataPath = resolve(__dirname, "../src/data/mockData.json");
  const mockData = JSON.parse(readFileSync(mockDataPath, "utf-8"));

  const categoriesCollection = db.collection("categories");

  // Check if categories already exist
  const existingCount = await categoriesCollection.countDocuments();
  if (existingCount > 0) {
    console.log(
      `  ⚠ Categories already exist (${existingCount}). Skipping seed.`
    );
    return;
  }

  const categories = mockData.categories.map((cat) => ({
    legacyId: cat.category_id,
    name: cat.category_name,
    slug: slugify(cat.category_name, { lower: true, strict: true }),
    description: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await categoriesCollection.insertMany(categories);
  console.log(`  ✓ Seeded ${categories.length} categories`);
}

async function migrateArticles(db) {
  const mockDataPath = resolve(__dirname, "../src/data/mockData.json");
  const mockData = JSON.parse(readFileSync(mockDataPath, "utf-8"));

  const articlesCollection = db.collection("articles");
  const categoriesCollection = db.collection("categories");

  // Check if articles already exist
  const existingCount = await articlesCollection.countDocuments();
  if (existingCount > 0) {
    console.log(
      `  ⚠ Articles already exist (${existingCount}). Skipping migration.`
    );
    return;
  }

  // Build category ID map (legacyId -> MongoDB _id)
  const categories = await categoriesCollection.find({}).toArray();
  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.legacyId] = cat._id.toString();
  });

  const now = new Date();

  const articles = mockData.news.map((news) => {
    const articleSlug = slugify(news.title, {
      lower: true,
      strict: true,
    }).slice(0, 200);

    // Convert plain text details to Tiptap JSON format
    const tiptapContent = {
      type: "doc",
      content: news.details
        ? news.details.split("\n").filter(Boolean).map((paragraph) => ({
            type: "paragraph",
            content: [{ type: "text", text: paragraph }],
          }))
        : [],
    };

    return {
      legacyId: news._id,
      title: news.title,
      slug: articleSlug,
      subtitle: "",
      excerpt: news.details ? news.details.slice(0, 200) : "",
      content: tiptapContent,
      categoryId: categoryMap[news.category_id] || news.category_id,
      tags: [],
      coverImage: {
        url: news.image_url || "",
        alt: news.title,
      },
      thumbnailUrl: news.thumbnail_url || "",
      authorId: null, // No user reference for legacy articles
      authorName: news.author?.name || "Unknown",
      authorImage: news.author?.img || "",
      status: "PUBLISHED", // All existing articles are published
      workflow: {
        submittedAt: news.author?.published_date
          ? new Date(news.author.published_date)
          : now,
        reviewedAt: now,
        publishedAt: news.author?.published_date
          ? new Date(news.author.published_date)
          : now,
        reviewedBy: null,
      },
      revision: {
        version: 1,
        requestedBy: null,
        requestedAt: null,
        comment: null,
      },
      editorial: {
        editorNotes: "",
        factChecked: false,
        featured: false,
        trending: news.others_info?.is_trending || false,
        todaysPick: news.others_info?.is_todays_pick || false,
      },
      stats: {
        views: news.total_view || 0,
      },
      rating: news.rating || null,
      createdAt: news.author?.published_date
        ? new Date(news.author.published_date)
        : now,
      updatedAt: now,
    };
  });

  await articlesCollection.insertMany(articles);
  console.log(`  ✓ Migrated ${articles.length} articles`);
}

main();
