"use client";

import React, { useState, useEffect } from "react";
import {
  Archive,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Check,
  X,
  RefreshCw,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // New category form
  const [showForm, setShowForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", slug: "", description: "" });

  // Editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  async function handleCreate() {
    if (!newCat.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: newCat.name.trim(),
        slug: newCat.slug.trim() || generateSlug(newCat.name),
        description: newCat.description.trim(),
      };
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Category created!");
        setNewCat({ name: "", slug: "", description: "" });
        setShowForm(false);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create category");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id) {
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast.success("Category updated!");
        setEditingId(null);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update category");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Category deleted");
        setCategories((prev) => prev.filter((c) => c._id?.toString() !== id));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete category");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm mt-1">
            {categories.length} categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all"
          >
            <Plus size={15} />
            Add Category
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">New Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Name *
              </label>
              <input
                type="text"
                value={newCat.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setNewCat((f) => ({
                    ...f,
                    name,
                    slug: f.slug || generateSlug(name),
                  }));
                }}
                placeholder="e.g. Technology"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Slug *
              </label>
              <input
                type="text"
                value={newCat.slug}
                onChange={(e) =>
                  setNewCat((f) => ({ ...f, slug: e.target.value }))
                }
                placeholder="e.g. technology"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={newCat.description}
              onChange={(e) =>
                setNewCat((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Short description..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setNewCat({ name: "", slug: "", description: "" });
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Archive size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm">No categories yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map((cat) => {
              const id = cat._id?.toString();
              const isEditing = editingId === id;
              const isDeleting = deletingId === id;

              return (
                <div
                  key={id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, name: e.target.value }))
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={editForm.slug || ""}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, slug: e.target.value }))
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-300"
                        placeholder="slug"
                      />
                      <input
                        type="text"
                        value={editForm.description || ""}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                        placeholder="Description"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Tag size={14} className="text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm">
                          {cat.name}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          /{cat.slug}
                          {cat.description && (
                            <span className="font-sans ml-2 text-slate-400">
                              — {cat.description}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdate(id)}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-all disabled:opacity-60"
                        >
                          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <X size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(id);
                            setEditForm({
                              name: cat.name,
                              slug: cat.slug,
                              description: cat.description || "",
                            });
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Edit category"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(id, cat.name)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete category"
                        >
                          {isDeleting ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </>
                    )}
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
