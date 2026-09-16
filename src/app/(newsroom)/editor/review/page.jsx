import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { ClipboardCheck, Search, Filter, LayoutList, LayoutGrid, AlertCircle, Clock, Users } from "lucide-react";
import Link from "next/link";
import ArticleStatusBadge from "@/components/newsroom/ArticleStatusBadge";
import { formatDistanceToNow } from "date-fns";

export default async function EditorialReviewQueue({ searchParams }) {
  await requireRole([USER_ROLES.EDITOR, USER_ROLES.ADMIN]);
  
  const articlesDb = await getCollection(COLLECTIONS.ARTICLES);
  
  // Parse search params for filters
  const view = searchParams?.view || "list";
  const statusFilter = searchParams?.status || "ALL";

  let query = { 
    status: { $in: ["SUBMITTED", "IN_REVIEW", "FACT_CHECK", "RESUBMITTED", "NEEDS_CHANGES"] } 
  };
  
  if (statusFilter !== "ALL") {
    query.status = statusFilter;
  }

  const articles = await articlesDb.find(query).sort({ updatedAt: -1 }).toArray();

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-6 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
            <ClipboardCheck className="text-indigo-600" size={32} />
            Editorial Review Queue
          </h1>
          <p className="text-slate-500 mt-2">Manage and review incoming story submissions.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by headline or author..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
          <Link href="/editor/review?view=list" className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            <LayoutList size={18} />
          </Link>
          <Link href="/editor/review?view=kanban" className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            <LayoutGrid size={18} />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200">
        <Link href="/editor/review?status=ALL" className={`pb-3 text-sm font-bold border-b-2 transition-colors ${statusFilter === 'ALL' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          All Pending
        </Link>
        <Link href="/editor/review?status=SUBMITTED" className={`pb-3 text-sm font-bold border-b-2 transition-colors ${statusFilter === 'SUBMITTED' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          New Submissions
        </Link>
        <Link href="/editor/review?status=FACT_CHECK" className={`pb-3 text-sm font-bold border-b-2 transition-colors ${statusFilter === 'FACT_CHECK' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Fact Check
        </Link>
        <Link href="/editor/review?status=RESUBMITTED" className={`pb-3 text-sm font-bold border-b-2 transition-colors ${statusFilter === 'RESUBMITTED' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Resubmitted
        </Link>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {articles.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider font-semibold text-slate-500">
                <th className="px-6 py-4">Story</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map(article => (
                <tr key={article._id.toString()} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/editor/review/${article._id}`} className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 block">
                      {article.title}
                    </Link>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-medium px-2 py-0.5 rounded-sm bg-slate-100">{article.categoryName || article.categoryId || "Category"}</span>
                      {article.lockedBy && (
                        <span className="text-orange-600 flex items-center gap-1 font-semibold">
                          <AlertCircle size={12} /> Locked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 flex items-center gap-2 mt-2">
                    <Users size={14} className="text-slate-400" />
                    {article.authorName || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ArticleStatusBadge status={article.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 flex items-center gap-1.5 mt-2">
                    <Clock size={14} className="text-slate-400" />
                    {formatDistanceToNow(new Date(article.updatedAt))} ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link href={`/editor/review/${article._id}`} className="inline-flex px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ClipboardCheck size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Queue is empty</h3>
            <p className="text-slate-500 mt-1">There are no articles pending review with the current filters.</p>
          </div>
        )}
      </div>

    </div>
  );
}
