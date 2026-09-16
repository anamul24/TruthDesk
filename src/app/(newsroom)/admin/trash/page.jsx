import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { Trash2, Search, Filter, RotateCcw, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default async function TrashRecovery() {
  await requireRole([USER_ROLES.ADMIN]);

  const articlesDb = await getCollection(COLLECTIONS.ARTICLES);
  // Get soft-deleted articles
  const deletedArticles = await articlesDb.find({ isDeleted: true }).sort({ updatedAt: -1 }).limit(50).toArray();

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
          <Trash2 className="text-red-600" size={32} />
          Recovery Bin
        </h1>
        <p className="text-slate-500 mt-2">Restore soft-deleted content or permanently erase it.</p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3 text-red-800">
        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-sm">Warning: Permanent Deletion</h3>
          <p className="text-sm mt-1">Actions taken here to permanently delete items cannot be undone. Always verify before erasing.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search deleted items..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>
        <button className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
          Empty Trash
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider font-semibold text-slate-500">
              <th className="px-6 py-4 w-1/2">Item</th>
              <th className="px-6 py-4">Deleted By</th>
              <th className="px-6 py-4">Date Deleted</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deletedArticles.map(article => (
              <tr key={article._id.toString()} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 text-sm line-clamp-1">{article.title || "Untitled"}</div>
                  <div className="text-xs text-slate-400 mt-1">ID: {article._id.toString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {/* Mocking deletedBy for now */}
                  System Admin
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {format(new Date(article.updatedAt), "MMM d, yyyy h:mm a")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-green-600 hover:bg-green-50 hover:border-green-200 rounded-lg text-sm font-medium transition-colors">
                      <RotateCcw size={14} /> Restore
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg text-sm font-medium transition-colors">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {deletedArticles.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-500">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trash2 size={24} className="text-slate-300" />
                  </div>
                  Recovery bin is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
