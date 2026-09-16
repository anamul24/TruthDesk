import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { CalendarDays, Clock, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function EditorSchedulePage() {
  await requireRole([USER_ROLES.EDITOR, USER_ROLES.ADMIN]);
  
  const articlesDb = await getCollection(COLLECTIONS.ARTICLES);
  
  // Find all scheduled articles
  const scheduledArticles = await articlesDb.find({ status: "SCHEDULED" }).sort({ "workflow.publishedAt": 1 }).toArray();

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-6 font-sans">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
          <CalendarDays className="text-blue-600" size={32} />
          Scheduled Publishing
        </h1>
        <p className="text-slate-500 mt-2">Manage articles waiting to be published automatically.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        {scheduledArticles.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider font-semibold text-slate-500">
                <th className="px-6 py-4">Publish Time</th>
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scheduledArticles.map(article => (
                <tr key={article._id.toString()} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Clock size={16} className="text-blue-500" />
                      {article.workflow?.publishedAt ? format(new Date(article.workflow.publishedAt), "MMM d, yyyy h:mm a") : "Pending"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/editor/review/${article._id}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {article.authorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-3 py-1.5 bg-white text-slate-600 border border-slate-200 hover:text-blue-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
                        Reschedule
                      </button>
                      <button className="px-3 py-1.5 bg-white text-red-600 border border-slate-200 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <CalendarDays size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No scheduled articles</h3>
            <p className="text-slate-500 mt-1">There are no articles in the publishing queue.</p>
          </div>
        )}
      </div>

    </div>
  );
}
