import { getCollection, COLLECTIONS } from "@/lib/db";
import { format } from "date-fns";
import { ObjectId } from "mongodb";

// Helper to map MongoDB article to old frontend format
function mapArticle(article) {
  if (!article) return null;

  // Handle TipTap JSON content parsing to plain text for the excerpt/details
  let detailsText = article.excerpt || "";
  if (!detailsText && article.content && article.content.content) {
    // Extract plain text for card previews (300 chars max)
    detailsText = article.content.content
      .filter((node) => node.type === "paragraph" && node.content)
      .map((node) => node.content.map((textNode) => textNode.text || "").join(""))
      .join("\n")
      .slice(0, 300) + "...";
  }

  // Format date safely
  let pubDate = "Just now";
  try {
    const d = article.workflow?.publishedAt || article.createdAt || new Date();
    pubDate = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(d)).replace(',', ' at').replace(',', '');
  } catch (e) {
    // fallback
  }

  return {
    _id: article._id.toString(),
    category_id: article.categoryId,
    title: article.title || "Untitled",
    image_url: article.coverImage?.url || article.thumbnailUrl || "",
    details: detailsText,
    author: {
      name: article.authorName || "TruthDesk Staff",
      img: article.authorImage || "https://i.pravatar.cc/150?img=11",
      published_date: pubDate,
    },
    total_view: article.stats?.views || 0,
    rating: article.rating || { number: 0, badge: "" },
    others_info: {
      is_todays_pick: article.editorial?.todaysPick || false,
      is_trending: article.editorial?.trending || false,
    },
    // Full Tiptap JSON content for the details page renderer
    content: article.content,
    isTopNews: article.editorial?.topNews || false,
  };
}

export async function getCategories() {
  try {
    const collection = await getCollection(COLLECTIONS.CATEGORIES);
    const categories = await collection.find({}).sort({ name: 1 }).toArray();

    // Map to old format: { category_id: legacyId, category_name: name }
    const mappedCategories = categories.map((c) => ({
      category_id: c.legacyId || c._id.toString(),
      category_name: c.name,
      _id: c._id.toString(),
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
          category.legacyId ? { categoryId: category.legacyId } : null
        ].filter(Boolean);
      } else {
        query.categoryId = category_id;
      }
    }

    const articles = await collection
      .find(query)
      // Sort: newest published first, then newest created first
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
