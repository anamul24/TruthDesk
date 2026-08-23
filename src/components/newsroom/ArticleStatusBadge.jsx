import React from "react";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", bg: "bg-slate-100", text: "text-slate-700" },
  SUBMITTED: { label: "Submitted", bg: "bg-blue-100", text: "text-blue-700" },
  IN_REVIEW: { label: "In Review", bg: "bg-indigo-100", text: "text-indigo-700" },
  REVISION_REQUESTED: { label: "Revision Required", bg: "bg-orange-100", text: "text-orange-700" },
  RESUBMITTED: { label: "Resubmitted", bg: "bg-sky-100", text: "text-sky-700" },
  APPROVED: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700" },
  PUBLISHED: { label: "Published", bg: "bg-green-100", text: "text-green-700" },
  REJECTED: { label: "Rejected", bg: "bg-red-100", text: "text-red-700" },
  ARCHIVED: { label: "Archived", bg: "bg-gray-100", text: "text-gray-500" },
};

export default function ArticleStatusBadge({ status, size = "sm" }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

  const sizeClasses = {
    xs: "text-[10px] px-2 py-0.5",
    sm: "text-xs px-2.5 py-1",
    md: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${config.bg} ${config.text} ${sizeClasses[size] || sizeClasses.sm}`}
    >
      {config.label}
    </span>
  );
}
