import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import Link from "next/link";
import { Eye, BarChart3, FileText, TrendingUp, Users, ArrowLeft } from "lucide-react";

export default async function AdminAnalyticsPage() {
  await requireRole([USER_ROLES.ADMIN, USER_ROLES.EDITOR]);

  const articlesCol = await getCollection(COLLECTIONS.ARTICLES);

  // Total views + published articles
  const globalStats = await articlesCol
    .aggregate([
      { $match: { status: "PUBLISHED" } },
      { $group: { _id: null, totalViews: { $sum: "$stats.views" }, totalArticles: { $sum: 1 } } },
    ])
    .toArray();

  const totalViews = globalStats[0]?.totalViews || 0;
  const totalPublished = globalStats[0]?.totalArticles || 0;
  const avgViews = totalPublished > 0 ? Math.round(totalViews / totalPublished) : 0;

  // Top 10 viewed articles
  const topArticles = await articlesCol
    .find({ status: "PUBLISHED" })
    .sort({ "stats.views": -1 })
    .limit(10)
    .project({ title: 1, "stats.views": 1, authorName: 1, categoryName: 1, "workflow.publishedAt": 1, slug: 1 })
    .toArray();

  // Views by category
  const byCategory = await articlesCol
    .aggregate([
      { $match: { status: "PUBLISHED" } },
      { $group: { _id: "$categoryName", views: { $sum: "$stats.views" }, count: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 15 },
    ])
    .toArray();

  // Journalist performance
  const journalistPerf = await articlesCol
    .aggregate([
      { $match: { status: "PUBLISHED" } },
      {
        $group: {
          _id: { authorId: "$authorId", authorName: "$authorName" },
          articles: { $sum: 1 },
          views: { $sum: "$stats.views" },
        },
      },
      {
        $project: {
          _id: 0,
          authorName: "$_id.authorName",
          articles: 1,
          views: 1,
          avg: { $round: [{ $cond: [{ $eq: ["$articles", 0] }, 0, { $divide: ["$views", "$articles"] }] }, 0] },
        },
      },
      { $sort: { views: -1 } },
    ])
    .toArray();

  const maxViews = topArticles[0]?.stats?.views || 1;
  const maxCatViews = byCategory[0]?.views || 1;

  const formatDate = (d) => {
    if (!d) return "—";
    return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dhaka", month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 size={22} className="text-indigo-500" />
          News Performance Analytics
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Platform-wide view statistics, top content, and journalist performance.</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "blue" },
          { label: "Published Articles", value: totalPublished.toLocaleString(), icon: FileText, color: "green" },
          { label: "Avg Views/Article", value: avgViews.toLocaleString(), icon: TrendingUp, color: "purple" },
          { label: "Journalists", value: journalistPerf.length.toString(), icon: Users, color: "orange" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              { blue: "bg-blue-100", green: "bg-green-100", purple: "bg-purple-100", orange: "bg-orange-100" }[stat.color]
            }`}>
              <stat.icon size={16} className={{ blue: "text-blue-600", green: "text-green-600", purple: "text-purple-600", orange: "text-orange-600" }[stat.color]} />
            </div>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed Articles */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-red-500" />
              Top Viewed Articles
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {topArticles.map((article, i) => {
              const views = article.stats?.views || 0;
              const pct = Math.round((views / maxViews) * 100);
              return (
                <div key={article._id.toString()} className="px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-200 w-5 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{article.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 flex-shrink-0 flex items-center gap-0.5">
                          <Eye size={10} />{views.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{article.authorName} · {article.categoryName}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {topArticles.length === 0 && (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">No published articles with views yet.</div>
            )}
          </div>
        </div>

        {/* Views by Category */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              Views by Category
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {byCategory.map((cat, i) => {
              const pct = Math.round(((cat.views || 0) / maxCatViews) * 100);
              return (
                <div key={cat._id || i} className="px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <p className="text-sm font-medium text-slate-800">{cat._id || "Uncategorized"}</p>
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-0.5">
                      <Eye size={10} />{(cat.views || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{cat.count} article{cat.count !== 1 ? "s" : ""}</p>
                </div>
              );
            })}
            {byCategory.length === 0 && (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">No data yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Journalist Performance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Users size={16} className="text-purple-500" />
            Journalist Performance
          </h2>
        </div>
        {journalistPerf.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">No journalist data yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="text-left px-6 py-3 font-semibold">#</th>
                  <th className="text-left px-6 py-3 font-semibold">Journalist</th>
                  <th className="text-right px-6 py-3 font-semibold">Articles</th>
                  <th className="text-right px-6 py-3 font-semibold">Total Views</th>
                  <th className="text-right px-6 py-3 font-semibold">Avg Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalistPerf.map((j, i) => (
                  <tr key={j.authorName || i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400 font-bold text-xs">{i + 1}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">{j.authorName || "Unknown"}</td>
                    <td className="px-6 py-3.5 text-right text-slate-700">{j.articles}</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                      <span className="flex items-center justify-end gap-1"><Eye size={12} className="text-slate-400" />{(j.views || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-slate-600">{Math.round(j.avg || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
