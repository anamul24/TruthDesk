"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Loader2,
  Filter,
  Eye,
  RefreshCw,
  User,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import ArticleStatusBadge from "@/components/newsroom/ArticleStatusBadge";
import Link from "next/link";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Revision Requested", value: "REVISION_REQUESTED" },
  { label: "Resubmitted", value: "RESUBMITTED" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Archived", value: "ARCHIVED" },
];

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function fetchArticles() {
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/articles?status=${statusFilter}`
        : "/api/articles";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      } else {
        toast.error("Failed to load articles");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchArticles();
  }, [statusFilter]);

  const filtered = search
    ? articles.filter(
        (a) =>
          a.title?.toLowerCase().includes(search.toLowerCase()) ||
          a.authorName?.toLowerCase().includes(search.toLowerCase())
      )
    : articles;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Articles</h1>
          <p className="text-slate-500 text-sm mt-1">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchArticles}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
          />
        </div>
        <div className="relative">
          <Filter
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.slice(0, 5).map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === s.value
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Articles List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-slate-400" />
            <span className="ml-3 text-slate-500 text-sm">
              Loading articles...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FileText size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm">No articles found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((article) => (
              <div
                key={article._id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate text-sm">
                    {article.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {article.authorName || "Unknown"}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {article.updatedAt
                        ? formatDistanceToNow(new Date(article.updatedAt)) +
                          " ago"
                        : "Recently"}
                    </span>
                    {article.categoryName && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span>{article.categoryName}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ArticleStatusBadge status={article.status} />
                  {["SUBMITTED", "RESUBMITTED", "IN_REVIEW"].includes(
                    article.status
                  ) && (
                    <Link
                      href={`/editor/review/${article._id}`}
                      className="text-xs font-medium text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                    >
                      <Eye size={12} />
                      Review
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
