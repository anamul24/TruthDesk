import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import Link from "next/link";
import { BarChart3, Eye, FileText, TrendingUp, Star, ArrowLeft } from "lucide-react";

export default async function JournalistPerformancePage() {
  const session = await requireRole([USER_ROLES.JOURNALIST]);
  const user = session?.user;

  const collection = await getCollection(COLLECTIONS.ARTICLES);
  const authorId = user?.id;

  // Published articles for this journalist only
  const publishedArticles = await collection
    .find({ authorId, status: "PUBLISHED" })
    .sort({ "stats.views": -1 })
    .toArray();

  const totalPublished = publishedArticles.length;
  const totalViews = publishedArticles.reduce((sum, a) => sum + (a.stats?.views || 0), 0);
  const avgViews = totalPublished > 0 ? Math.round(totalViews / totalPublished) : 0;
  const mostViewed = publishedArticles[0] || null;

  // Recent articles (by publish date)
  const recentArticles = [...publishedArticles]
    .sort((a, b) => {
      const dateA = new Date(a.workflow?.publishedAt || a.createdAt);
      const dateB = new Date(b.workflow?.publishedAt || b.createdAt);
      return dateB - dateA;
    })
    .slice(0, 5);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/journalist"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 size={22} className="text-blue-500" />
          My Performance
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Analytics for your published articles — views, engagement, and top stories.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <Eye size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalViews.toLocaleString()}</p>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">Total Views</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center mb-3">
            <FileText size={16} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalPublished}</p>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">Published</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
            <TrendingUp size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{avgViews.toLocaleString()}</p>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">Avg Views</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
            <Star size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{mostViewed ? mostViewed.stats?.views || 0 : 0}</p>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">Best Article</p>
        </div>
      </div>

      {/* Most Viewed Article highlight */}
      {mostViewed && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">🏆 Most Viewed Article</p>
          <Link href={`/journalist/articles/${mostViewed._id}`} className="font-semibold text-slate-900 hover:text-amber-600 transition-colors">
            {mostViewed.title}
          </Link>
          <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Eye size={13} />{(mostViewed.stats?.views || 0).toLocaleString()} views</span>
            <span>·</span>
            <span>{mostViewed.categoryName || "Uncategorized"}</span>
            <span>·</span>
            <span>{formatDate(mostViewed.workflow?.publishedAt)}</span>
          </div>
        </div>
      )}

      {/* All articles with view counts */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Eye size={16} />
            All Articles — Views
          </h2>
          <span className="text-xs text-slate-400">{totalPublished} articles</span>
        </div>

        {publishedArticles.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No published articles yet. Start writing to see your performance!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {publishedArticles.map((article, i) => {
              const views = article.stats?.views || 0;
              const maxViews = publishedArticles[0]?.stats?.views || 1;
              const pct = Math.round((views / maxViews) * 100);

              return (
                <div key={article._id.toString()} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-200 leading-none">{String(i + 1).padStart(2, "0")}</span>
                        <Link
                          href={`/journalist/articles/${article._id}`}
                          className="font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 text-sm"
                        >
                          {article.title}
                        </Link>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 ml-7">
                        {article.categoryName} · {formatDate(article.workflow?.publishedAt)}
                      </p>

                      {/* View bar */}
                      <div className="ml-7 mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden w-full max-w-sm">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 text-slate-700">
                      <Eye size={13} className="text-slate-400" />
                      <span className="text-sm font-bold">{views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
