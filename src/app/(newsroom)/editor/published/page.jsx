import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { Newspaper, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function EditorPublishedPage() {
  const session = await requireRole([USER_ROLES.EDITOR, USER_ROLES.ADMIN]);

  const collection = await getCollection(COLLECTIONS.ARTICLES);

  const publishedArticles = await collection
    .find({ status: "PUBLISHED" })
    .sort({ "workflow.publishedAt": -1, updatedAt: -1 })
    .limit(50)
    .toArray();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Published Articles</h1>
        <p className="text-slate-500 mt-1">
          All articles that have been approved and published.
        </p>
      </div>

      {/* Articles List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <Newspaper size={18} className="text-slate-500" />
          <h2 className="font-semibold text-slate-800">
            Published ({publishedArticles.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {publishedArticles.length > 0 ? (
            publishedArticles.map((article) => (
              <div
                key={article._id.toString()}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 line-clamp-1">
                    {article.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500">
                    <span>by {article.authorName || "Unknown"}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {article.workflow?.publishedAt
                        ? `${formatDistanceToNow(new Date(article.workflow.publishedAt))} ago`
                        : article.updatedAt
                        ? `${formatDistanceToNow(new Date(article.updatedAt))} ago`
                        : "Recently"}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="flex items-center gap-1">
                      <Eye size={13} />
                      {(article.stats?.views || 0).toLocaleString()} views
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                    Published
                  </span>
                  <Link
                    href={`/editor/review/${article._id}`}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-16 text-center">
              <Newspaper size={40} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">
                No published articles yet
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Approved articles will appear here once published.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
