import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { History, Search, Filter, Calendar } from "lucide-react";
import { format } from "date-fns";

export default async function AuditLogs() {
  await requireRole([USER_ROLES.ADMIN]);

  // Mock audit logs representing the immutable timeline
  const logs = [
    { id: "1", action: "Published Article", target: "Global Summit Reaches Historic Agreement", targetType: "ARTICLE", user: "Jane Editor", role: "EDITOR", time: new Date(Date.now() - 3600000) },
    { id: "2", action: "Updated Role", target: "Sarah Khan -> Fact Checker", targetType: "USER", user: "System Admin", role: "ADMIN", time: new Date(Date.now() - 7200000) },
    { id: "3", action: "Created Breaking Alert", target: "Major Policy Shift", targetType: "ALERT", user: "Mark Desk", role: "EDITOR", time: new Date(Date.now() - 10800000) },
    { id: "4", action: "Soft Deleted", target: "Draft: Unconfirmed Report", targetType: "ARTICLE", user: "System Admin", role: "ADMIN", time: new Date(Date.now() - 86400000) },
    { id: "5", action: "Submitted Article", target: "Local Elections Yield Surprising Results", targetType: "ARTICLE", user: "Rafiq Reporter", role: "JOURNALIST", time: new Date(Date.now() - 90000000) },
  ];

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
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                  {format(log.time, "MMM d, yyyy HH:mm:ss")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-bold text-slate-900 text-sm">{log.action}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">{log.targetType}</span>
                    <span className="line-clamp-1">{log.target}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-slate-900 text-sm">{log.user}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{log.role}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <span>Showing 1 to 5 of 1,240 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}
