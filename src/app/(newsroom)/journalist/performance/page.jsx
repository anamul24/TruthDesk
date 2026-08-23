import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { BarChart3, Eye, FileText, TrendingUp, Award } from "lucide-react";

export default async function PerformancePage() {
  const session = await requireRole([USER_ROLES.JOURNALIST, USER_ROLES.ADMIN]);
  const user = session?.user;

  const collection = await getCollection(COLLECTIONS.ARTICLES);
  const query = { authorName: user?.name };

  // Get all articles by this journalist
  const articles = await collection
    .find(query)
    .sort({ "stats.views": -1 })
    .toArray();

  const totalViews = articles.reduce((sum, a) => sum + (a.stats?.views || 0), 0);
  const publishedCount = articles.filter((a) => a.status === "PUBLISHED").length;
  const totalArticles = articles.length;
  const avgViews = publishedCount > 0 ? Math.round(totalViews / publishedCount) : 0;

  const topArticles = articles
    .filter((a) => a.status === "PUBLISHED")
    .slice(0, 5);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Performance</h1>
        <p className="text-slate-500 mt-1">
          Track your articles&apos; reach and engagement.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Articles
            </span>
            <FileText size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-700">{totalArticles}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Published
            </span>
            <Award size={20} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-emerald-700">{publishedCount}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Views
            </span>
            <Eye size={20} className="text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-indigo-700">
            {totalViews.toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg. Views / Article
            </span>
            <TrendingUp size={20} className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-700">{avgViews}</p>
        </div>
      </div>

      {/* Top Performing Articles */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <BarChart3 size={18} className="text-slate-500" />
          <h2 className="font-semibold text-slate-800">Top Performing Articles</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {topArticles.length > 0 ? (
            topArticles.map((article, index) => (
              <div
                key={article._id.toString()}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-2xl font-bold text-slate-200 w-8 flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {article.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {article.categoryName || "Uncategorized"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 flex-shrink-0">
                  <Eye size={15} />
                  {(article.stats?.views || 0).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-16 text-center">
              <BarChart3 size={40} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">
                No published articles yet
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Publish articles to see your performance data here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
