import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { History, Search, Filter, Calendar, FileText, Users, Settings, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 20;

export default async function AuditLogs({ searchParams }) {
  await requireRole([USER_ROLES.ADMIN]);

  const page = parseInt(searchParams?.page || "1");
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const logsDb = await getCollection(COLLECTIONS.AUDIT_LOGS);
  const [logs, totalCount] = await Promise.all([
    logsDb.find({}).sort({ createdAt: -1 }).skip(skip).limit(ITEMS_PER_PAGE).toArray(),
    logsDb.countDocuments({}),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const getTargetTypeClass = (type) => {
    switch (type) {
      case "ARTICLE": return "bg-blue-100 text-blue-700";
      case "USER": return "bg-purple-100 text-purple-700";
      case "SYSTEM": return "bg-slate-100 text-slate-600";
      case "ALERT": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
            <History className="text-blue-600" size={32} />
            Audit Logs
          </h1>
          <p className="text-slate-500 mt-2">Immutable timeline of critical system and editorial events.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
          <Calendar size={18} />
          Export Report
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by action, user, or target..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg outline-none">
            <option>All Actions</option>
            <option>Articles</option>
            <option>Users & Roles</option>
            <option>System</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider font-semibold text-slate-500">
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4 w-1/3">Target Entity</th>
              <th className="px-6 py-4">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length > 0 ? logs.map(log => (
              <tr key={log._id.toString()} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                  {format(new Date(log.createdAt || log.timestamp || new Date()), "MMM d, yyyy HH:mm:ss")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-bold text-slate-900 text-sm">{log.action || "Unknown Action"}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    {log.targetType && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getTargetTypeClass(log.targetType)}`}>
                        {log.targetType}
                      </span>
                    )}
                    <span className="line-clamp-1">{log.target || log.targetId || "—"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-slate-900 text-sm">{log.userName || log.userId || "System"}</div>
                  {log.role && <div className="text-xs text-slate-500 mt-0.5">{log.role}</div>}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <History size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500 font-medium">No audit logs found.</p>
                  <p className="text-slate-400 text-sm mt-1">Events will appear here as actions are taken in the system.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Real Pagination */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <span>
            {totalCount > 0
              ? `Showing ${skip + 1}–${Math.min(skip + ITEMS_PER_PAGE, totalCount)} of ${totalCount.toLocaleString()} entries`
              : "No entries found"}
          </span>
          <div className="flex gap-1">
            {page > 1 ? (
              <a href={`?page=${page - 1}`} className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100">Prev</a>
            ) : (
              <button className="px-3 py-1 bg-white border border-slate-200 rounded opacity-50 cursor-not-allowed" disabled>Prev</button>
            )}
            <span className="px-3 py-1 bg-slate-900 text-white rounded">{page}</span>
            {page < totalPages ? (
              <a href={`?page=${page + 1}`} className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100">Next</a>
            ) : (
              <button className="px-3 py-1 bg-white border border-slate-200 rounded opacity-50 cursor-not-allowed" disabled>Next</button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
