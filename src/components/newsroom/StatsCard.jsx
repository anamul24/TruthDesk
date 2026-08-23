"use client";

import React from "react";
import {
  ClipboardCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Newspaper,
  TrendingUp,
  Users,
  BarChart2,
} from "lucide-react";

// Icon name → component map (safe for server→client prop passing)
const ICON_MAP = {
  ClipboardCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Newspaper,
  TrendingUp,
  Users,
  BarChart2,
};

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: "text-blue-500",
    border: "border-blue-100",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    icon: "text-orange-500",
    border: "border-orange-100",
  },
  green: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: "text-emerald-500",
    border: "border-emerald-100",
  },
  gray: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    icon: "text-slate-500",
    border: "border-slate-100",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    icon: "text-indigo-500",
    border: "border-indigo-100",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    icon: "text-red-500",
    border: "border-red-100",
  },
};

/**
 * StatsCard — accepts icon as a string name (e.g. "ClipboardCheck")
 * so it can be safely used from Server Components.
 */
export default function StatsCard({ label, value, icon, color = "blue" }) {
  const colors = colorMap[color] || colorMap.blue;
  const Icon = typeof icon === "string" ? ICON_MAP[icon] : icon;

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-xl p-5 transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {Icon && <Icon size={20} className={colors.icon} />}
      </div>
      <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
    </div>
  );
}
