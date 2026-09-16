import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { CheckSquare, Plus, Calendar, Clock, MoreVertical, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export default async function EditorAssignmentsPage() {
  const session = await requireRole([USER_ROLES.EDITOR, USER_ROLES.ADMIN]);
  const editorId = session?.user?.id;

  const db = await getCollection(COLLECTIONS.ASSIGNMENTS);
  const assignments = await db.find({ editorId }).sort({ deadline: 1 }).toArray();

  const getStatusBadge = (status) => {
    switch(status) {
      case "ASSIGNED": return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">Assigned</span>;
      case "IN_PROGRESS": return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">In Progress</span>;
      case "SUBMITTED": return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">Submitted</span>;
      case "COMPLETED": return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Completed</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "BREAKING": return <span className="px-2 py-0.5 border border-red-200 bg-red-50 text-red-700 rounded text-[10px] font-bold uppercase tracking-wider">Breaking</span>;
      case "URGENT": return <span className="px-2 py-0.5 border border-orange-200 bg-orange-50 text-orange-700 rounded text-[10px] font-bold uppercase tracking-wider">Urgent</span>;
      default: return <span className="px-2 py-0.5 border border-slate-200 bg-slate-50 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">Normal</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-6 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
            <CheckSquare className="text-blue-600" size={32} />
            Assignments
          </h1>
          <p className="text-slate-500 mt-2">Manage team workload and track story progress.</p>
        </div>
        <Link 
          href="/editor/assignments/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Assignment
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {assignments.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider font-semibold text-slate-500">
                <th className="px-6 py-4 w-1/3">Story / Brief</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map(assignment => (
                <tr key={assignment._id.toString()} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      {getPriorityBadge(assignment.priority)}
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{assignment.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{assignment.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                    ID: {assignment.journalistId.substring(0,6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(assignment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {format(new Date(assignment.deadline), "MMM d, h:mm a")}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 ml-5">
                      {formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <CheckSquare size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No active assignments</h3>
            <p className="text-slate-500 mt-1">You haven't assigned any stories to the team yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
