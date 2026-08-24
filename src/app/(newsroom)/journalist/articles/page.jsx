"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Clock,
  Trash2,
  Eye,
  Edit3,
  Send,
  Loader2,
} from "lucide-react";
import ArticleStatusBadge from "@/components/newsroom/ArticleStatusBadge";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const TABS = [
  { label: "All", value: "" },
  { label: "Drafts", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Revision Required", value: "REVISION_REQUESTED" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function JournalistArticlesPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";
  const [activeTab, setActiveTab] = useState(initialStatus);
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

  async function handleDelete(articleId) {
    if (!confirm("Are you sure you want to delete this draft?")) return;

    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Draft deleted successfully");
        fetchArticles();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete article");
    }
  }

  async function handleSubmit(articleId) {
    if (!confirm("Submit this article for editorial review?")) return;

    try {
      const res = await fetch(`/api/articles/${articleId}/submit`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Article submitted for review!");
        fetchArticles();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit");
      }
    } catch {
      toast.error("Failed to submit article");
    }
  }

  const filtered = searchQuery
    ? articles.filter(
        (a) =>
          a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Stories</h1>
          <p className="text-slate-500 mt-1">
            Manage all your articles in one place.
          </p>
        </div>
        <Link
          href="/journalist/write"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Story
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
          />
        </div>
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
                    href={`/journalist/articles/${article._id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                  >
                    {article.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {article.updatedAt
                        ? `Updated ${formatDistanceToNow(new Date(article.updatedAt))} ago`
                        : "Recently"}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>
                      {article.categoryName || "Uncategorized"}
                    </span>
                    {article.revision?.version > 1 && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span>v{article.revision.version}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <ArticleStatusBadge status={article.status} />
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/journalist/articles/${article._id}`}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="View"
                    >
                      <Eye size={16} />
                    </Link>
                    {["DRAFT", "REVISION_REQUESTED", "PUBLISHED"].includes(
                      article.status
                    ) && (
                      <Link
                        href={`/journalist/articles/${article._id}/edit`}
                        className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </Link>
                    )}
                    {article.status === "DRAFT" && (
                      <>
                        <button
                          onClick={() => handleSubmit(article._id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                          title="Submit for Review"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <FileText size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">
              No stories found
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              {activeTab
                ? `You don't have any articles with "${activeTab.replace(/_/g, " ").toLowerCase()}" status.`
                : "You haven't written any stories yet."}
            </p>
            <Link
              href="/journalist/write"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} />
              Create your first story
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
