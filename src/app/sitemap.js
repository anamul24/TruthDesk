import { getCollection, COLLECTIONS } from "@/lib/db";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://truthdesk.vercel.app";

  const collection = await getCollection(COLLECTIONS.ARTICLES);
  const articles = await collection
    .find({ status: "PUBLISHED" })
    .project({ _id: 1, "workflow.publishedAt": 1, updatedAt: 1 })
    .sort({ "workflow.publishedAt": -1 })
    .limit(1000)
    .toArray();

  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}/news/${article._id}`,
    lastModified: article.workflow?.publishedAt || article.updatedAt || new Date(),
    changeFrequency: "never",
    priority: 0.8,
  }));

  const categoryCollection = await getCollection(COLLECTIONS.CATEGORIES);
  const categoriesDoc = await categoryCollection.findOne({});
  const categories = categoriesDoc?.news_category || [];

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.category_id}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    ...categoryUrls,
    ...articleUrls,
  ];
}
