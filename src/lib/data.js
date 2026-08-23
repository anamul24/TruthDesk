import { getCollection, COLLECTIONS } from "@/lib/db";
import { format } from "date-fns";
import { ObjectId } from "mongodb";

// Helper to map MongoDB article to old frontend format
function mapArticle(article) {
  if (!article) return null;

  // Handle TipTap JSON content parsing to plain text for the excerpt/details
  let detailsText = article.excerpt || "";
  if (!detailsText && article.content && article.content.content) {
    // Very simple plain text extraction
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
    pubDate = format(new Date(d), "yyyy-MM-dd HH:mm:ss");
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
    // Adding the raw content just in case details component uses it
    content: article.content,
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

    // "08" was the hardcoded ID for "All News"
    if (category_id && category_id !== "08") {
      query.$or = [{ categoryId: category_id }];
    }

    const articles = await collection
      .find(query)
      .sort({ "workflow.publishedAt": -1, createdAt: -1 })
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
