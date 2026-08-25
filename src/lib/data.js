import { getCollection, COLLECTIONS } from "@/lib/db";
import { ObjectId } from "mongodb";

// Helper to map MongoDB article to old frontend format
function mapArticle(article) {
  if (!article) return null;

  // Handle TipTap JSON content parsing to plain text for the excerpt/details
  let detailsText = article.excerpt || "";
  if (!detailsText && article.content && article.content.content) {
    detailsText = article.content.content
      .filter((node) => node.type === "paragraph" && node.content)
      .map((node) => node.content.map((textNode) => textNode.text || "").join(""))
      .join("\n")
      .slice(0, 300) + "...";
  }

  // Format date — BD timezone
  let pubDate = "Just now";
  try {
    const d = article.workflow?.publishedAt || article.createdAt || new Date();
    pubDate = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .format(new Date(d))
      .replace(",", " at")
      .replace(",", "");
  } catch (e) {
    // fallback
  }

  return {
    _id: article._id.toString(),
    category_id: article.categoryId,
    categoryName: article.categoryName || "",
    title: article.title || "Untitled",
    slug: article.slug || "",
    subtitle: article.subtitle || "",
    image_url: article.coverImage?.url || article.thumbnailUrl || "",
    image_alt: article.coverImage?.alt || article.title || "",
    details: detailsText,
    excerpt: article.excerpt || detailsText,
    tags: article.tags || [],
    author: {
      id: article.authorId || "",
      name: article.authorName || "TruthDesk Staff",
      img: article.authorImage || "",
      published_date: pubDate,
    },
    publishedAt: article.workflow?.publishedAt || article.createdAt,
    updatedAt: article.updatedAt,
    total_view: article.stats?.views || 0,
    rating: article.rating || { number: 0, badge: "" },
    others_info: {
      is_todays_pick: article.editorial?.todaysPick || false,
      is_trending: article.editorial?.trending || false,
      is_featured: article.editorial?.featured || false,
    },
    content: article.content,
    isTopNews: article.editorial?.topNews || false,
    isBreaking: article.editorial?.featured || false,
  };
}

export async function getCategories() {
  try {
    const collection = await getCollection(COLLECTIONS.CATEGORIES);
    const categories = await collection.find({}).sort({ name: 1 }).toArray();

    const mappedCategories = categories.map((c) => ({
      category_id: c.legacyId || c._id.toString(),
      category_name: c.name,
      _id: c._id.toString(),
      slug: c.slug || "",
    }));

    return { news_category: mappedCategories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { news_category: [] };
  }
}

export async function getNewsByCategoryId(category_id) {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    let query = { status: "PUBLISHED" };

    if (category_id && category_id !== "08") {
      const categoryCollection = await getCollection(COLLECTIONS.CATEGORIES);
      let catQuery;
      try {
        catQuery = { $or: [{ _id: new ObjectId(category_id) }, { legacyId: category_id }] };
      } catch (e) {
        catQuery = { legacyId: category_id };
      }

      const category = await categoryCollection.findOne(catQuery);

      if (category) {
        query.$or = [
          { categoryId: category._id.toString() },
          category.legacyId ? { categoryId: category.legacyId } : null,
        ].filter(Boolean);
      } else {
        query.categoryId = category_id;
      }
    }

    const articles = await collection
      .find(query)
      .sort({ "workflow.publishedAt": -1, updatedAt: -1, createdAt: -1 })
      .toArray();

    return articles.map(mapArticle);
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function getNewsDetailsById(news_id) {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);

    let query;
    try {
      query = { $or: [{ _id: new ObjectId(news_id) }, { legacyId: news_id }] };
    } catch (e) {
      query = { legacyId: news_id };
    }

    const article = await collection.findOne(query);
    return mapArticle(article);
  } catch (error) {
    console.error("Error fetching news details:", error);
    return null;
  }
}

export async function getTopNews() {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const articles = await collection
      .find({ status: "PUBLISHED", "editorial.topNews": true })
      .sort({ "workflow.publishedAt": -1, createdAt: -1 })
      .limit(5)
      .toArray();
    return articles.map(mapArticle);
  } catch (error) {
    console.error("Error fetching top news:", error);
    return [];
  }
}

// ============================================================
// NEW DATA FUNCTIONS — Homepage & Article Page
// ============================================================

/**
 * Get the latest published articles (for homepage Latest News section)
 */
export async function getLatestArticles(limit = 6) {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const articles = await collection
      .find({ status: "PUBLISHED" })
      .sort({ "workflow.publishedAt": -1, updatedAt: -1, createdAt: -1 })
      .limit(limit)
      .toArray();
    return articles.map(mapArticle);
  } catch (error) {
    console.error("Error fetching latest articles:", error);
    return [];
  }
}

/**
 * Get featured/hero articles for the homepage (top 3: 1 hero + 2 secondary).
 * Priority: editorial.topNews first, then most recent.
 */
export async function getFeaturedArticles(limit = 3) {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);

    // Try to get articles with images first, sorted by topNews flag then date
    const articles = await collection
      .find({ status: "PUBLISHED", "coverImage.url": { $exists: true, $ne: "" } })
      .sort({ "editorial.topNews": -1, "workflow.publishedAt": -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    // If not enough, fall back to all published
    if (articles.length < limit) {
      const fallback = await collection
        .find({ status: "PUBLISHED" })
        .sort({ "workflow.publishedAt": -1, createdAt: -1 })
        .limit(limit)
        .toArray();
      return fallback.map(mapArticle);
    }

    return articles.map(mapArticle);
  } catch (error) {
    console.error("Error fetching featured articles:", error);
    return [];
  }
}

/**
 * Get editor's picks (editorial.todaysPick: true).
 */
export async function getEditorsPicks(limit = 3) {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const articles = await collection
      .find({ status: "PUBLISHED", "editorial.todaysPick": true })
      .sort({ "workflow.publishedAt": -1, createdAt: -1 })
      .limit(limit)
      .toArray();
    return articles.map(mapArticle);
  } catch (error) {
    console.error("Error fetching editor's picks:", error);
    return [];
  }
}

/**
 * Get most-read articles sorted by stats.views.
 */
export async function getMostReadArticles(limit = 5) {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const articles = await collection
      .find({ status: "PUBLISHED" })
      .sort({ "stats.views": -1, "workflow.publishedAt": -1 })
      .limit(limit)
      .toArray();
    return articles.map(mapArticle);
  } catch (error) {
    console.error("Error fetching most read articles:", error);
    return [];
  }
}

/**
 * Get articles by category ID with optional limit.
 */
export async function getArticlesByCategory(categoryId, limit = 3) {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const categoryCollection = await getCollection(COLLECTIONS.CATEGORIES);

    let catQuery;
    try {
      catQuery = { $or: [{ _id: new ObjectId(categoryId) }, { legacyId: categoryId }] };
    } catch (e) {
      catQuery = { legacyId: categoryId };
    }

    const category = await categoryCollection.findOne(catQuery);

    let articleQuery = { status: "PUBLISHED" };
    if (category) {
      articleQuery.$or = [
        { categoryId: category._id.toString() },
        category.legacyId ? { categoryId: category.legacyId } : null,
      ].filter(Boolean);
    } else {
      articleQuery.categoryId = categoryId;
    }

    const articles = await collection
      .find(articleQuery)
      .sort({ "workflow.publishedAt": -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    return articles.map(mapArticle);
  } catch (error) {
    console.error("Error fetching articles by category:", error);
    return [];
  }
}

/**
 * Get trending topics — aggregated from article tags.
 * Returns an array of { tag, count } objects.
 */
export async function getTrendingTopics(limit = 10) {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const result = await collection
      .aggregate([
        { $match: { status: "PUBLISHED", tags: { $exists: true, $ne: [] } } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();

    return result.map((r) => ({ tag: r._id, count: r.count }));
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    return [];
  }
}

/**
 * Get breaking news — articles with editorial.featured: true.
 * Falls back to 5 most recent if none flagged.
 */
export async function getBreakingNews(limit = 5) {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);

    let articles = await collection
      .find({ status: "PUBLISHED", "editorial.featured": true })
      .sort({ "workflow.publishedAt": -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    // Fallback: most recent published articles
    if (articles.length === 0) {
      articles = await collection
        .find({ status: "PUBLISHED" })
        .sort({ "workflow.publishedAt": -1, createdAt: -1 })
        .limit(limit)
        .toArray();
    }

    return articles.map(mapArticle);
  } catch (error) {
    console.error("Error fetching breaking news:", error);
    return [];
  }
}

/**
 * Get related articles — same category, excluding current article.
 */
export async function getRelatedArticles(categoryId, excludeId, limit = 3) {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const categoryCollection = await getCollection(COLLECTIONS.CATEGORIES);

    let catQuery;
    try {
      catQuery = { $or: [{ _id: new ObjectId(categoryId) }, { legacyId: categoryId }] };
    } catch (e) {
      catQuery = { legacyId: categoryId };
    }

    const category = await categoryCollection.findOne(catQuery);

    let excludeObjId;
    try { excludeObjId = new ObjectId(excludeId); } catch (e) { excludeObjId = null; }

    let articleQuery = {
      status: "PUBLISHED",
      _id: excludeObjId ? { $ne: excludeObjId } : { $ne: excludeId },
    };

    if (category) {
      articleQuery.$or = [
        { categoryId: category._id.toString() },
        category.legacyId ? { categoryId: category.legacyId } : null,
      ].filter(Boolean);
    } else if (categoryId) {
      articleQuery.categoryId = categoryId;
    }

    const articles = await collection
      .find(articleQuery)
      .sort({ "workflow.publishedAt": -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    return articles.map(mapArticle);
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return [];
  }
}

/**
 * Increment article view count.
 */
export async function incrementArticleViews(articleId) {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    let query;
    try {
      query = { $or: [{ _id: new ObjectId(articleId) }, { legacyId: articleId }] };
    } catch (e) {
      query = { legacyId: articleId };
    }
    await collection.updateOne(query, { $inc: { "stats.views": 1 } });
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
}

/**
 * Get categories that have at least `minArticles` published articles.
 * Returns category objects with article count.
 */
export async function getActiveCategoriesWithCount(minArticles = 1) {
  try {
    const collection = await getCollection(COLLECTIONS.ARTICLES);
    const result = await collection
      .aggregate([
        { $match: { status: "PUBLISHED" } },
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
        { $match: { count: { $gte: minArticles } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    const categoryCollection = await getCollection(COLLECTIONS.CATEGORIES);
    const categoryIds = result.map((r) => r._id);

    const categories = await categoryCollection
      .find({
        $or: categoryIds.flatMap((id) => {
          try {
            return [{ _id: new ObjectId(id) }, { legacyId: id }];
          } catch {
            return [{ legacyId: id }];
          }
        }),
      })
      .toArray();

    return result
      .map((r) => {
        const cat = categories.find(
          (c) => c._id.toString() === r._id || c.legacyId === r._id
        );
        if (!cat) return null;
        return {
          category_id: cat.legacyId || cat._id.toString(),
          category_name: cat.name,
          _id: cat._id.toString(),
          slug: cat.slug || "",
          count: r.count,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Error fetching active categories:", error);
    return [];
  }
}
