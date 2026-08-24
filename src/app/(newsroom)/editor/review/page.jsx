"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Search,
  Loader2,
  Eye,
  PlayCircle,
  Clock,
  User,
} from "lucide-react";
import ArticleStatusBadge from "@/components/newsroom/ArticleStatusBadge";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import DeleteArticleButton from "@/components/newsroom/DeleteArticleButton";

const TABS = [
  { label: "Pending", value: "SUBMITTED" },
  { label: "Resubmitted", value: "RESUBMITTED" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "All", value: "" },
];

export default function EditorReviewQueuePage() {
  const [activeTab, setActiveTab] = useState("SUBMITTED");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchArticles();
  }, [activeTab]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const url = activeTab
        ? `/api/articles?status=${activeTab}`
        : "/api/articles";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error("Failed to fetch articles", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartReview(articleId) {
    try {
      const res = await fetch(`/api/articles/${articleId}/review`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Review started!");
        fetchArticles();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to start review");
      }
    } catch {
      toast.error("Failed to start review");
    }
  }

  const filtered = searchQuery
    ? articles.filter(
        (a) =>
          a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Review Queue</h1>
        <p className="text-slate-500 mt-1">
          Review, approve, or request revisions on submitted articles.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Articles List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-slate-400" />
            <span className="ml-3 text-slate-500">Loading articles...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filtered.map((article) => (
              <div
                key={article._id}
                className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/editor/review/${article._id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                  >
                    {article.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {article.authorName || "Unknown"}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {article.updatedAt
                        ? `${formatDistanceToNow(new Date(article.updatedAt))} ago`
                        : "Recently"}
                    </span>
                    {article.categoryName && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span>{article.categoryName}</span>
                      </>
                    )}
                    {article.revision?.version > 1 && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-indigo-600 font-medium">
                          v{article.revision.version}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <ArticleStatusBadge status={article.status} />
                  {["SUBMITTED", "RESUBMITTED"].includes(article.status) && (
                    <button
                      onClick={() => handleStartReview(article._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <PlayCircle size={14} />
                      Start Review
                    </button>
                  )}
                  <Link
                    href={`/editor/review/${article._id}`}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="View Article"
                  >
                    <Eye size={16} />
                  </Link>
                  <DeleteArticleButton articleId={article._id} title={article.title} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <ClipboardCheck size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">
              No articles found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab
                ? `No articles with "${activeTab.replace(/_/g, " ").toLowerCase()}" status.`
                : "The review queue is empty."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
