import React from "react";
import { ObjectId } from "mongodb";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  CheckSquare,
  ChevronRight,
  Radio,
  User,
  MessageSquare,
} from "lucide-react";

export default async function JournalistAssignmentDetailPage({ params }) {
  const session = await requireRole([USER_ROLES.JOURNALIST, USER_ROLES.ADMIN]);
  const authorId = session?.user?.id;
  const { id } = await params;

  const assignmentsDb = await getCollection(COLLECTIONS.ASSIGNMENTS);
  let assignment;

  try {
    assignment = await assignmentsDb.findOne({ _id: new ObjectId(id) });
  } catch {
    assignment = null;
  }

  // Not found or doesn't belong to this journalist (unless admin)
  if (!assignment || (assignment.journalistId !== authorId && session?.user?.role !== "admin")) {
    notFound();
  }

  // Check if a linked article exists for this assignment
  const articlesDb = await getCollection(COLLECTIONS.ARTICLES);
  const linkedArticle = await articlesDb.findOne({
    $or: [
      { assignmentId: id },
      { assignmentId: assignment._id.toString() },
    ],
  });

  const isOverdue = assignment.deadline && isPast(new Date(assignment.deadline));

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "BREAKING": return "bg-red-100 text-red-700 border-red-200";
      case "URGENT": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "ASSIGNED": return "bg-slate-100 text-slate-700";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-700";
      case "SUBMITTED": return "bg-purple-100 text-purple-700";
      case "COMPLETED": return "bg-green-100 text-green-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-4xl mx-auto space-y-8 font-sans">

      {/* Back */}
      <Link
        href="/journalist/assignments"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Assignments
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top accent bar based on priority */}
        <div className={`h-1 w-full ${
          assignment.priority === "BREAKING" ? "bg-red-500" :
          assignment.priority === "URGENT" ? "bg-orange-500" :
          "bg-blue-500"
        }`} />

        <div className="p-6 md:p-8 space-y-6">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${getPriorityStyle(assignment.priority)}`}>
              {assignment.priority === "BREAKING" && <Radio size={10} className="inline mr-1" />}
              {assignment.priority} Priority
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${getStatusStyle(assignment.status)}`}>
              {assignment.status?.replace("_", " ")}
            </span>
            {isOverdue && assignment.status !== "COMPLETED" && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                <AlertTriangle size={10} /> Overdue
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {assignment.title}
            </h1>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 border-y border-slate-100 py-4">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              Assigned by: <strong className="text-slate-700 ml-1">{assignment.editorName || "Editor"}</strong>
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              Created: {assignment.createdAt
                ? format(new Date(assignment.createdAt), "MMM d, yyyy")
                : "Unknown"}
            </span>
          </div>

          {/* Deadline callout */}
          <div className={`rounded-xl px-5 py-4 flex items-center gap-4 ${
            isOverdue
              ? "bg-red-50 border border-red-200"
              : "bg-blue-50 border border-blue-100"
          }`}>
            <div className={`p-2.5 rounded-xl ${isOverdue ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
              <Clock size={20} />
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${isOverdue ? "text-red-500" : "text-blue-500"}`}>
                {isOverdue ? "Deadline Passed" : "Deadline"}
              </p>
              <p className={`font-bold text-sm ${isOverdue ? "text-red-800" : "text-slate-900"}`}>
                {format(new Date(assignment.deadline), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
              <p className={`text-xs mt-0.5 ${isOverdue ? "text-red-600" : "text-slate-500"}`}>
                {formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Brief */}
      {assignment.description && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare size={18} className="text-slate-400" />
            Story Brief
          </h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
        </div>
      )}

      {/* Editor Notes */}
      {assignment.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider">Editor Notes</h3>
          <p className="text-amber-900 text-sm leading-relaxed whitespace-pre-wrap">{assignment.notes}</p>
        </div>
      )}

      {/* Linked Article */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText size={18} className="text-slate-400" />
          Linked Article
        </h2>

        {linkedArticle ? (
          <Link
            href={`/journalist/articles/${linkedArticle._id}`}
            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div>
              <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                {linkedArticle.title || "Untitled"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Status: <span className="font-semibold">{linkedArticle.status}</span>
                {linkedArticle.updatedAt && ` · Updated ${formatDistanceToNow(new Date(linkedArticle.updatedAt))} ago`}
              </p>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-500" />
          </Link>
        ) : (
          <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl">
            <FileText size={28} className="mx-auto text-slate-200 mb-2" />
            <p className="text-slate-500 text-sm font-medium">No article linked yet.</p>
            <p className="text-slate-400 text-xs mt-1 mb-4">Start writing to begin working on this assignment.</p>
            <Link
              href={`/journalist/write?assignment=${assignment._id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
            >
              <FileText size={16} /> Start Writing
            </Link>
          </div>
        )}
      </div>

      {/* Action Bar */}
      {!["COMPLETED", "SUBMITTED"].includes(assignment.status) && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/journalist/write?assignment=${assignment._id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            <FileText size={18} />
            {linkedArticle ? "Continue Writing" : "Start Writing"}
          </Link>
          <Link
            href="/journalist/assignments"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <CheckSquare size={18} />
            All Assignments
          </Link>
        </div>
      )}

    </div>
  );
}
