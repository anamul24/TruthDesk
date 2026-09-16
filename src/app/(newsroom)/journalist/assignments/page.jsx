import React from "react";
import { getSession, requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { Clock, Calendar, AlertCircle, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export default async function AssignmentsPage() {
  const session = await requireRole([USER_ROLES.JOURNALIST, USER_ROLES.ADMIN]);
  const authorId = session?.user?.id;

  const db = await getCollection(COLLECTIONS.ASSIGNMENTS);
  const assignments = await db.find({ journalistId: authorId }).sort({ deadline: 1 }).toArray();

  const activeAssignments = assignments.filter(a => ["ASSIGNED", "IN_PROGRESS"].includes(a.status));
  const completedAssignments = assignments.filter(a => ["SUBMITTED", "COMPLETED"].includes(a.status));

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "BREAKING": return "bg-red-100 text-red-700 border-red-200";
      case "URGENT": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-serif">Assignment Center</h1>
        <p className="text-slate-500 mt-2">Manage your current and upcoming story assignments.</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-blue-600" />
            Active Assignments
          </h2>
          
          <div className="space-y-4">
            {activeAssignments.length > 0 ? activeAssignments.map((assignment) => (
              <div key={assignment._id.toString()} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {assignment.status.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{assignment.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{assignment.description}</p>
                    
                    <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} /> 
                        Due {formatDistanceToNow(new Date(assignment.deadline))} ({format(new Date(assignment.deadline), "MMM d, h:mm a")})
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    <Link
                      href={`/journalist/write?assignment=${assignment._id}`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors text-sm"
                    >
                      <FileText size={16} />
                      Start Writing
                    </Link>
                    <Link
                      href={`/journalist/assignments/${assignment._id}`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors text-sm"
                    >
                      View Brief
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-10 text-center">
                <Calendar size={32} className="mx-auto text-slate-400 mb-3" />
                <h3 className="text-sm font-semibold text-slate-700">No active assignments</h3>
                <p className="text-sm text-slate-500 mt-1">You don't have any pending assignments at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {completedAssignments.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4 text-opacity-80">Past Assignments</h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {completedAssignments.map((assignment) => (
                <div key={assignment._id.toString()} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors opacity-70 hover:opacity-100">
                  <div>
                    <h3 className="font-medium text-slate-900">{assignment.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">Completed {formatDistanceToNow(new Date(assignment.updatedAt))} ago</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
