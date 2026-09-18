import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import StatsCard from "@/components/newsroom/StatsCard";
import { BarChart3, TrendingUp, Users, Clock, Filter, MousePointerClick } from "lucide-react";

export default async function GlobalAnalytics() {
  await requireRole([USER_ROLES.ADMIN]);

  // Get real article performance data from DB
  const articlesDb = await getCollection(COLLECTIONS.ARTICLES);
  const categoriesDb = await getCollection(COLLECTIONS.CATEGORIES);

  // Top performing articles by views
  const topArticles = await articlesDb
    .find({ status: "PUBLISHED" })
    .sort({ "stats.views": -1 })
    .limit(5)
    .project({ title: 1, authorName: 1, "stats.views": 1, categoryName: 1 })
    .toArray();

  // Category distribution
  const categoryStats = await articlesDb.aggregate([
    { $match: { status: "PUBLISHED" } },
    { $group: { _id: "$categoryName", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]).toArray();

  const totalPublished = categoryStats.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
            <BarChart3 className="text-indigo-600" size={32} />
            Global Analytics
          </h1>
          <p className="text-slate-500 mt-2">Content performance and category breakdown based on published articles.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Today</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-slate-900 text-white shadow-sm">7 Days</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">30 Days</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">90 Days</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-1"><Filter size={14} /> Custom</button>
        </div>
      </div>

      {/* High Level — note: external analytics not integrated */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800 flex items-start gap-2">
        <TrendingUp size={18} className="shrink-0 mt-0.5" />
        <span>External analytics (page views, bounce rate) are not yet integrated. The data below reflects content stored in the database.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Top Performing Articles</h2>
            <p className="text-xs text-slate-400 mt-0.5">By total views (from article stats)</p>
          </div>
          <div className="divide-y divide-slate-100">
            {topArticles.length > 0 ? topArticles.map((article, idx) => (
              <div key={article._id.toString()} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                <div className="text-lg font-black text-slate-300 w-6 text-center">{idx + 1}</div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{article.title}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex gap-3">
                    <span>By {article.authorName || "Unknown"}</span>
                    <span className="text-blue-600 font-medium">{(article.stats?.views || 0).toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-500">
                <TrendingUp size={28} className="mx-auto mb-2 text-slate-200" />
                <p className="text-sm">No published articles yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Top Categories</h2>
            <p className="text-xs text-slate-400 mt-0.5">By published article count</p>
          </div>
          <div className="p-6 space-y-5">
            {categoryStats.length > 0 ? categoryStats.map((cat, idx) => {
              const percentage = totalPublished > 0 ? Math.round((cat.count / totalPublished) * 100) : 0;
              const colors = ["bg-indigo-600", "bg-blue-500", "bg-green-500", "bg-orange-400", "bg-slate-400"];
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold">{cat._id || "Uncategorized"}</span>
                    <span className="text-slate-500">{percentage}% ({cat.count})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={`${colors[idx] || "bg-slate-400"} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            }) : (
              <div className="py-10 text-center text-slate-500">
                <BarChart3 size={28} className="mx-auto mb-2 text-slate-200" />
                <p className="text-sm">No published articles to show category breakdown.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
