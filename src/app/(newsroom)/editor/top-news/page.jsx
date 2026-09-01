"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Search,
  Calendar,
  Trash2,
  CheckCircle2,
  Loader2,
  Clock,
  X,
  Eye,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

export default function TopNewsManagerPage() {
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [currentTopNews, setCurrentTopNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [schedule, setSchedule] = useState({ startAt: "", endAt: "" });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/articles?status=PUBLISHED");
      if (res.ok) {
        const data = await res.json();
        const articles = data.articles || [];
        setPublishedArticles(articles);

        // Find the currently active top news
        const now = new Date();
        const active = articles.find((a) => {
          if (!a.editorial?.topNews) return false;
          const startOk = !a.editorial.topNewsStartAt || new Date(a.editorial.topNewsStartAt) <= now;
          const endOk = !a.editorial.topNewsEndAt || new Date(a.editorial.topNewsEndAt) >= now;
          return startOk && endOk;
        });
        setCurrentTopNews(active || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetTopNews() {
    if (!selectedArticle) {
      toast.error("Please select an article first");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${selectedArticle._id}/top-news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topNewsStartAt: schedule.startAt ? new Date(schedule.startAt).toISOString() : null,
          topNewsEndAt: schedule.endAt ? new Date(schedule.endAt).toISOString() : null,
        }),
      });

      if (res.ok) {
        toast.success(`"${selectedArticle.title}" set as Top News!`);
        setSelectedArticle(null);
        setSchedule({ startAt: "", endAt: "" });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to set top news");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveTopNews(articleId, title) {
    if (!confirm(`Remove "${title}" from Top News?`)) return;
    try {
      const res = await fetch(`/api/articles/${articleId}/top-news`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Top News removed. The latest article will now be shown.");
        fetchData();
      } else {
        toast.error("Failed to remove top news");
      }
    } catch {
      toast.error("An error occurred");
    }
  }

  const filtered = publishedArticles.filter((a) =>
    !searchQuery ||
    a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isActiveTopNews = (a) => {
    if (!a.editorial?.topNews) return false;
    const now = new Date();
    const startOk = !a.editorial.topNewsStartAt || new Date(a.editorial.topNewsStartAt) <= now;
    const endOk = !a.editorial.topNewsEndAt || new Date(a.editorial.topNewsEndAt) >= now;
    return startOk && endOk;
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Star size={22} className="text-amber-500 fill-amber-500" />
          Top News Control
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Pin any published article as the large Hero card. You can optionally schedule start and end times.
        </p>
      </div>

      {/* Current Top News banner */}
      <div className={`rounded-2xl border p-5 ${currentTopNews ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">
              {currentTopNews ? "🔴 Currently Active Top News" : "No Active Top News"}
            </p>
            {currentTopNews ? (
              <>
                <p className="font-semibold text-slate-900">{currentTopNews.title}</p>
                <p className="text-sm text-slate-500 mt-1">
                  By {currentTopNews.authorName}
                  {currentTopNews.editorial?.topNewsEndAt && (
                    <> · Expires {format(new Date(currentTopNews.editorial.topNewsEndAt), "MMM d, h:mm a")}</>
                  )}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                The most recently published article will be shown as the hero card.
              </p>
            )}
          </div>
          {currentTopNews && (
            <button
              onClick={() => handleRemoveTopNews(currentTopNews._id, currentTopNews.title)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
            >
              <X size={14} />
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Article Picker */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-3">Select Article to Pin</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search published articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">No published articles found.</div>
            ) : (
              filtered.map((article) => {
                const active = isActiveTopNews(article);
                const isSelected = selectedArticle?._id === article._id;
                return (
                  <button
                    key={article._id}
                    onClick={() => setSelectedArticle(isSelected ? null : article)}
                    className={`w-full text-left px-6 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                      isSelected
                        ? "bg-amber-50 border-l-2 border-amber-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm line-clamp-1">{article.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {article.authorName} · {article.categoryName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {active && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded uppercase">
                          Active
                        </span>
                      )}
                      {isSelected && <CheckCircle2 size={16} className="text-amber-500" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Schedule + Save */}
      {selectedArticle && (
        <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">
            Pinning: <span className="text-amber-600">{selectedArticle.title}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar size={13} className="inline mr-1" />
                Start Time <span className="text-slate-400">(optional — defaults to now)</span>
              </label>
              <input
                type="datetime-local"
                value={schedule.startAt}
                onChange={(e) => setSchedule({ ...schedule, startAt: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Clock size={13} className="inline mr-1" />
                End Time <span className="text-slate-400">(optional — no expiry if blank)</span>
              </label>
              <input
                type="datetime-local"
                value={schedule.endAt}
                onChange={(e) => setSchedule({ ...schedule, endAt: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSetTopNews}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} className="fill-white" />}
              {saving ? "Saving..." : "Set as Top News"}
            </button>
            <button
              onClick={() => setSelectedArticle(null)}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
