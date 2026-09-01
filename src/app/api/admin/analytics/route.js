import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS, getDb } from "@/lib/db";
import { requireRoleAPI } from "@/lib/authorize";

// GET /api/admin/analytics — admin-only analytics aggregation
export async function GET() {
  try {
    const { session, error } = await requireRoleAPI(["admin", "editor"]);
    if (error) return error;

    const articlesCol = await getCollection(COLLECTIONS.ARTICLES);
    const db = await getDb();

    // 1. Total views across all published articles
    const totalViewsResult = await articlesCol
      .aggregate([
        { $match: { status: "PUBLISHED" } },
        { $group: { _id: null, totalViews: { $sum: "$stats.views" }, totalArticles: { $sum: 1 } } },
      ])
      .toArray();

    const totalViews = totalViewsResult[0]?.totalViews || 0;
    const totalPublishedArticles = totalViewsResult[0]?.totalArticles || 0;

    // 2. Top viewed articles (top 10)
    const topViewedArticles = await articlesCol
      .find({ status: "PUBLISHED" })
      .sort({ "stats.views": -1 })
      .limit(10)
      .project({ title: 1, slug: 1, "stats.views": 1, authorName: 1, categoryName: 1, "workflow.publishedAt": 1 })
      .toArray();

    // 3. Views by category
    const viewsByCategory = await articlesCol
      .aggregate([
        { $match: { status: "PUBLISHED" } },
        {
          $group: {
            _id: "$categoryName",
            totalViews: { $sum: "$stats.views" },
            articleCount: { $sum: 1 },
          },
        },
        { $sort: { totalViews: -1 } },
        { $limit: 20 },
      ])
      .toArray();

    // 4. Journalist performance
    const journalistPerformance = await articlesCol
      .aggregate([
        { $match: { status: "PUBLISHED" } },
        {
          $group: {
            _id: { authorId: "$authorId", authorName: "$authorName" },
            totalArticles: { $sum: 1 },
            totalViews: { $sum: "$stats.views" },
          },
        },
        {
          $project: {
            _id: 0,
            authorId: "$_id.authorId",
            authorName: "$_id.authorName",
            totalArticles: 1,
            totalViews: 1,
            avgViews: { $round: [{ $divide: ["$totalViews", "$totalArticles"] }, 0] },
          },
        },
        { $sort: { totalViews: -1 } },
      ])
      .toArray();

    // 5. Recent views (last 7 days trend)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const viewsCollection = await getCollection(COLLECTIONS.ARTICLE_VIEWS);
    const recentViewsTrend = await viewsCollection
      .aggregate([
        { $match: { viewedAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$viewedAt", timezone: "Asia/Dhaka" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    return NextResponse.json({
      totalViews,
      totalPublishedArticles,
      topViewedArticles: topViewedArticles.map((a) => ({
        _id: a._id.toString(),
        title: a.title,
        views: a.stats?.views || 0,
        authorName: a.authorName,
        categoryName: a.categoryName,
        publishedAt: a.workflow?.publishedAt,
      })),
      viewsByCategory,
      journalistPerformance,
      recentViewsTrend,
    });
  } catch (err) {
    console.error("Failed to fetch analytics:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
