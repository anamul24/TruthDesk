"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

export default function BreakingNewsManagerPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ text: "", url: "", expiresAt: "" });

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/breaking-news");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingId(null);
    setForm({ text: "", url: "", expiresAt: "" });
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item._id);
    setForm({
      text: item.text || "",
      url: item.url || "",
      expiresAt: item.expiresAt
        ? new Date(item.expiresAt).toISOString().slice(0, 16)
        : "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.text.trim()) {
      toast.error("Breaking news text is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        text: form.text,
        url: form.url || null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };

      const url = editingId
        ? `/api/breaking-news/${editingId}`
        : "/api/breaking-news";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingId ? "Breaking news updated!" : "Breaking news published!");
        setShowForm(false);
        fetchItems();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this breaking news item?")) return;
    try {
      const res = await fetch(`/api/breaking-news/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully");
        fetchItems();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("An error occurred");
    }
  }

  const isExpired = (item) => item.expiresAt && new Date(item.expiresAt) < new Date();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Radio size={22} className="text-red-600" />
            Breaking News
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage breaking news ticker items. Expired items disappear automatically.
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Breaking News
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">
            {editingId ? "Edit Breaking News" : "New Breaking News"}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Headline / Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Enter breaking news text..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link URL <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://... or /news/article-slug"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expires At <span className="text-slate-400">(leave blank = no expiry)</span>
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <h2 className="font-semibold text-slate-800">Active Breaking News</h2>
          <span className="ml-auto text-xs text-slate-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Radio size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-medium text-slate-900">No breaking news</h3>
            <p className="text-sm text-slate-500 mt-1">Add a breaking news item to display it in the ticker.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const expired = isExpired(item);
              return (
                <div
                  key={item._id}
                  className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${expired ? "opacity-50" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {expired ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-green-700 bg-green-100 px-2 py-0.5 rounded">
                          <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-slate-900 mt-1">{item.text}</p>
                    {item.url && (
                      <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1 truncate">
                        <ExternalLink size={10} />
                        {item.url}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>By {item.createdBy}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {item.createdAt ? formatDistanceToNow(new Date(item.createdAt)) + " ago" : "—"}
                      </span>
                      {item.expiresAt && (
                        <>
                          <span>·</span>
                          <span className={`flex items-center gap-1 ${expired ? "text-red-400" : "text-amber-500"}`}>
                            Expires: {format(new Date(item.expiresAt), "MMM d, h:mm a")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(item)}
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
