import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import StatsCard from "@/components/newsroom/StatsCard";
import {
  ClipboardCheck,
  AlertCircle,
  Newspaper,
  CheckCircle2,
  Radio,
  Star,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { getCollection, COLLECTIONS } from "@/lib/db";
import ArticleStatusBadge from "@/components/newsroom/ArticleStatusBadge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function EditorDashboard() {
  const session = await requireRole([USER_ROLES.EDITOR, USER_ROLES.ADMIN]);
  const user = session?.user;

  const collection = await getCollection(COLLECTIONS.ARTICLES);

  // Stats aggregation
  const stats = await collection
    .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();

  const statsMap = stats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  // Pending review
  const pendingArticles = await collection
    .find({ status: { $in: ["SUBMITTED", "RESUBMITTED"] } })
    .sort({ updatedAt: -1 })
    .limit(5)
    .toArray();

  // In review
  const inReviewArticles = await collection
    .find({ status: "IN_REVIEW" })
    .sort({ updatedAt: -1 })
    .limit(3)
    .toArray();

  // Active top news
  const now = new Date();
  const activeTopNews = await collection.findOne({
    status: "PUBLISHED",
    "editorial.topNews": true,
    $and: [
      { $or: [{ "editorial.topNewsStartAt": { $exists: false } }, { "editorial.topNewsStartAt": { $lte: now } }] },
      { $or: [{ "editorial.topNewsEndAt": null }, { "editorial.topNewsEndAt": { $exists: false } }, { "editorial.topNewsEndAt": { $gte: now } }] },
    ],
  });

  // Active breaking news count
  const bnCollection = await getCollection(COLLECTIONS.BREAKING_NEWS);
  const activeBreakingCount = await bnCollection.countDocuments({
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } },
    ],
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const totalPending =
    (statsMap["SUBMITTED"] || 0) + (statsMap["RESUBMITTED"] || 0);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Editor"}
          </h1>
          <p className="text-slate-500 mt-1">
            Editorial overview — TruthDesk Newsroom
          </p>
        </div>
        <Link
          href="/editor/review"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <ClipboardCheck size={18} />
          Review Queue
          {totalPending > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
              {totalPending}
            </span>
          )}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          label="Pending Review"
          value={totalPending}
          icon="ClipboardCheck"
          color="orange"
        />
        <StatsCard
          label="In Review"
          value={statsMap["IN_REVIEW"] || 0}
          icon="FileText"
          color="indigo"
        />
        <StatsCard
          label="Published"
          value={statsMap["PUBLISHED"] || 0}
          icon="CheckCircle2"
          color="green"
        />
        <StatsCard
          label="Rejected"
          value={statsMap["REJECTED"] || 0}
          icon="XCircle"
          color="red"
        />
      </div>

      {/* Editorial Controls */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Editorial Controls
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Breaking News */}
          <Link
            href="/editor/breaking-news"
            className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-red-200 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-3">
              <Radio size={18} className="text-white" />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900 text-sm group-hover:text-red-600 transition-colors">
                Breaking News
              </p>
              {activeBreakingCount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                  {activeBreakingCount} live
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Manage ticker items with expiry</p>
          </Link>

          {/* Top News */}
          <Link
            href="/editor/top-news"
            className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-amber-200 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mb-3">
              <Star size={18} className="text-white" />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                Top News
              </p>
              {activeTopNews && (
                <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                  1 pinned
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTopNews ? `Pinned: "${activeTopNews.title.slice(0, 30)}..."` : "Pin a hero story with schedule"}
            </p>
          </Link>

          {/* Published Articles */}
          <Link
            href="/editor/published"
            className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center mb-3">
              <Newspaper size={18} className="text-white" />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900 text-sm group-hover:text-slate-700 transition-colors">
                Published
              </p>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                {statsMap["PUBLISHED"] || 0}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Manage all published articles</p>
          </Link>
        </div>
      </div>

      {/* Pending Review */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <AlertCircle size={18} className="text-orange-500" />
            Awaiting Review
            {totalPending > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalPending}
              </span>
            )}
          </h2>
          <Link
            href="/editor/review"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {pendingArticles.length > 0 ? (
            pendingArticles.map((article) => (
              <div
                key={article._id.toString()}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/editor/review/${article._id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                  >
                    {article.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
                    <span>by {article.authorName || "Unknown"}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>
                      {article.updatedAt
                        ? `${formatDistanceToNow(new Date(article.updatedAt))} ago`
                        : "Recently"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ArticleStatusBadge status={article.status} />
                  <Link
                    href={`/editor/review/${article._id}`}
                    className="text-sm font-medium text-white bg-slate-900 px-4 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-300 mb-3" />
              <h3 className="text-sm font-medium text-slate-900">All caught up!</h3>
              <p className="text-sm text-slate-500 mt-1">
                No articles are pending review right now.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Currently In Review */}
      {inReviewArticles.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-500" />
              Currently In Review
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {inReviewArticles.map((article) => (
              <div
                key={article._id.toString()}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/editor/review/${article._id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                  >
                    {article.title}
                  </Link>
                  <p className="text-sm text-slate-500 mt-1">
                    by {article.authorName || "Unknown"} · Reviewer:{" "}
                    {article.workflow?.reviewedBy || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ArticleStatusBadge status={article.status} />
                  <Link
                    href={`/editor/review/${article._id}`}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Continue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
