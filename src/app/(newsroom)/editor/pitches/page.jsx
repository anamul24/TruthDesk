import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { Send, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default async function EditorPitchesPage() {
  await requireRole([USER_ROLES.EDITOR, USER_ROLES.ADMIN]);

  const db = await getCollection(COLLECTIONS.PITCHES);
  // Get all pitches for all journalists (or filter by specific teams if needed in future)
  const pitches = await db.find({ status: "SUBMITTED" }).sort({ createdAt: -1 }).toArray();
  const reviewedPitches = await db.find({ status: { $ne: "SUBMITTED" } }).sort({ updatedAt: -1 }).limit(20).toArray();

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 font-sans">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
          <Send className="text-indigo-600" size={32} />
          Pitch Queue
        </h1>
        <p className="text-slate-500 mt-2">Review story ideas submitted by journalists.</p>
      </div>

      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Pending Pitches</h2>
        <div className="space-y-4">
          {pitches.length > 0 ? pitches.map(pitch => (
            <div key={pitch._id.toString()} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {pitch.urgency !== "NORMAL" && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-bold uppercase tracking-wider">
                        {pitch.urgency}
                      </span>
                    )}
                    <span className="text-xs font-medium text-slate-500">
                      Submitted by ID: {pitch.journalistId.substring(0,6)} • {formatDistanceToNow(new Date(pitch.createdAt))} ago
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{pitch.title}</h3>
                  <p className="text-sm text-slate-600 mt-2">{pitch.description}</p>
                </div>
                
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    <MessageSquare size={16} /> Request Info
                  </button>
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-xl border border-slate-200 border-dashed p-10 text-center">
              <p className="text-sm text-slate-500">No new pitches to review.</p>
            </div>
          )}
        </div>
      </section>

      {reviewedPitches.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4 opacity-70">Recently Reviewed</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 opacity-80 hover:opacity-100 transition-opacity">
            {reviewedPitches.map(pitch => (
              <div key={pitch._id.toString()} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{pitch.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">By ID: {pitch.journalistId.substring(0,6)} • {formatDistanceToNow(new Date(pitch.updatedAt))} ago</p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                  pitch.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  pitch.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {pitch.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
