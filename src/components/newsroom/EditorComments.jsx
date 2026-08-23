"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, AlertTriangle, XCircle } from "lucide-react";

export default function EditorComments({ comments }) {
  if (!comments || comments.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case "revision_request":
        return <AlertTriangle size={16} className="text-orange-500" />;
      case "rejection":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <MessageSquare size={16} className="text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "revision_request":
        return "border-l-orange-400 bg-orange-50/50";
      case "rejection":
        return "border-l-red-400 bg-red-50/50";
      default:
        return "border-l-blue-400 bg-blue-50/50";
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case "revision_request":
        return "Revision Request";
      case "rejection":
        return "Rejection Reason";
      default:
        return "Comment";
    }
  };

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div
          key={comment._id}
          className={`border-l-4 rounded-lg p-4 ${getBgColor(comment.type)}`}
        >
          <div className="flex items-center gap-2 mb-2">
            {getIcon(comment.type)}
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {getLabel(comment.type)}
            </span>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed">
            {comment.content}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="font-medium">{comment.authorName}</span>
            {comment.createdAt && (
              <>
                <span>·</span>
                <span>
                  {formatDistanceToNow(new Date(comment.createdAt))} ago
                </span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
