import React from "react";
import { getSession, requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { Plus, CheckCircle, Clock, AlertCircle, Send } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export default async function PitchesPage() {
  const session = await requireRole([USER_ROLES.JOURNALIST, USER_ROLES.ADMIN]);
  const authorId = session?.user?.id;

  const db = await getCollection(COLLECTIONS.PITCHES);
  const pitches = await db.find({ journalistId: authorId }).sort({ createdAt: -1 }).toArray();

  const getStatusDisplay = (status) => {
    switch(status) {
      case "APPROVED": return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Approved" };
      case "UNDER_REVIEW": return { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", label: "Under Review" };
      case "NEEDS_INFO": return { icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50", label: "Needs Info" };
      case "REJECTED": return { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Rejected" };
      default: return { icon: Send, color: "text-slate-600", bg: "bg-slate-50", label: "Submitted" };
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Story Pitches</h1>
          <p className="text-slate-500 mt-2">Track the status of your submitted story ideas.</p>
        </div>
        <Link 
          href="/journalist/pitches/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Pitch
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {pitches.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {pitches.map((pitch) => {
              const statusDisplay = getStatusDisplay(pitch.status);
              const StatusIcon = statusDisplay.icon;
              return (
                <div key={pitch._id.toString()} className="p-5 sm:p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${statusDisplay.bg} ${statusDisplay.color}`}>
                          <StatusIcon size={14} />
                          {statusDisplay.label}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {pitch.urgency !== "NORMAL" && (
                            <span className="text-red-600 font-bold mr-2 uppercase tracking-wider">{pitch.urgency}</span>
                          )}
                          Submitted {format(new Date(pitch.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{pitch.title}</h3>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{pitch.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Send size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No pitches yet</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6 max-w-sm mx-auto">
              You haven't submitted any story pitches. Got a great idea? Pitch it to the editorial team.
            </p>
            <Link 
              href="/journalist/pitches/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              Submit your first pitch
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
