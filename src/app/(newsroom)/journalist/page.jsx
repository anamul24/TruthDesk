import React from "react";
import { getSession, requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import StatsCard from "@/components/newsroom/StatsCard";
import { FileText } from "lucide-react";
import { getCollection, COLLECTIONS } from "@/lib/db";
import ArticleStatusBadge from "@/components/newsroom/ArticleStatusBadge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function JournalistDashboard() {
  // Ensure user is authorized
  const session = await requireRole([USER_ROLES.JOURNALIST, USER_ROLES.ADMIN]);
  const user = session?.user;

  // Fetch stats and recent articles from DB - use ONLY authorId for strict isolation
  const collection = await getCollection(COLLECTIONS.ARTICLES);
  const authorId = user?.id;
  const query = { authorId: authorId };

  // Aggregate stats per article status for this journalist only
  const stats = await collection.aggregate([
    { $match: query },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).toArray();

  const statsMap = stats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const recentArticles = await collection
    .find(query)
    .sort({ updatedAt: -1 })
    .limit(5)
    .toArray();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Journalist"}
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening in your workspace today.
          </p>
        </div>
        <Link
          href="/journalist/write"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <FileText size={18} />
          Write New Story
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Drafts"
          value={statsMap["DRAFT"] || 0}
          icon="FileText"
          color="gray"
        />
        <StatsCard
          label="In Review"
          value={statsMap["SUBMITTED"] || 0}
          icon="ClipboardCheck"
          color="indigo"
        />
        <StatsCard
          label="Revision Required"
          value={statsMap["REVISION_REQUESTED"] || 0}
          icon="AlertCircle"
          color="orange"
        />
        <StatsCard
          label="Published"
          value={statsMap["PUBLISHED"] || 0}
          icon="CheckCircle2"
          color="green"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent Stories</h2>
          <Link
            href="/journalist/articles"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentArticles.length > 0 ? (
            recentArticles.map((article) => (
              <div
                key={article._id.toString()}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <Link 
                    href={`/journalist/articles/${article._id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {article.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
                    <span>
                      Updated {formatDistanceToNow(new Date(article.updatedAt))} ago
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{article.categoryName || `Category ${article.categoryId}`}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ArticleStatusBadge status={article.status} />
                  <Link
                    href={`/journalist/articles/${article._id}`}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <FileText size={32} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-medium text-slate-900">No stories yet</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                You haven't created any stories yet.
              </p>
              <Link
                href="/journalist/write"
                className="inline-flex font-medium text-sm text-blue-600 hover:text-blue-700"
              >
                Create your first story →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
