"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Image as ImageIcon,
  Save,
  Loader2,
} from "lucide-react";
import TiptapEditor from "@/components/newsroom/TiptapEditor";
import Link from "next/link";

const formSchema = z.object({
  title: z.string().min(5, "Headline must be at least 5 characters").max(300),
  subtitle: z.string().max(500).optional(),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  excerpt: z.string().max(1000).optional(),
});

export default function EditorEditArticlePage() {
  const router = useRouter();
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [articleRes, categoriesRes] = await Promise.all([
          fetch(`/api/articles/${id}`),
          fetch("/api/categories"),
        ]);

        if (articleRes.ok) {
          const data = await articleRes.json();
          const art = data.article;
          setArticle(art);
          setContent(art.content);
          setCoverImageUrl(art.coverImage?.url || "");
          reset({
            title: art.title || "",
            subtitle: art.subtitle || "",
            categoryId: art.categoryId || "",
            tags: art.tags?.join(", ") || "",
            excerpt: art.excerpt || "",
          });
        } else {
          toast.error("Article not found");
          router.push("/editor/published");
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to load article", error);
        toast.error("Failed to load article");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, reset, router]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Uploading image...");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setCoverImageUrl(data.url);
      toast.success("Image uploaded", { id: toastId });
    } catch {
      toast.error("Failed to upload image", { id: toastId });
    }
  };

  const onSubmit = async (data) => {
    if (!content) {
      toast.error("Article content cannot be empty");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Saving changes...");

    try {
      const payload = {
        ...data,
        content,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
        coverImage: { url: coverImageUrl, alt: data.title },
      };

      const updateRes = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!updateRes.ok) {
        const err = await updateRes.json();
        throw new Error(err.error || "Failed to save");
      }

      toast.success("Changes saved successfully", { id: toastId });
      router.push("/editor/published");
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen bg-slate-50">
      {/* Main Content Area */}
      <div className="flex-1 lg:max-w-4xl border-r border-slate-200 bg-white shadow-sm z-10">
        {/* Top Bar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200">
          <Link
            href="/editor/published"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Published
          </Link>
          <span className="text-sm font-medium text-slate-400">
            Editing: {article?.title?.substring(0, 50)}...
          </span>
        </div>

        <form id="article-form" className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Write your headline..."
              className="w-full text-4xl md:text-5xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none bg-transparent"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-red-500 text-sm font-medium">
                {errors.title.message}
              </p>
            )}

            <input
              type="text"
              placeholder="Short description or subtitle..."
              className="w-full text-xl md:text-2xl font-medium text-slate-600 placeholder:text-slate-300 focus:outline-none bg-transparent"
              {...register("subtitle")}
            />
          </div>

          <div className="min-h-[500px]">
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your article body..."
            />
          </div>
        </form>
      </div>

      {/* Right Sidebar - Settings */}
      <div className="w-full lg:w-80 bg-slate-50 p-6 flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
            Article Settings
          </h3>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("categoryId")}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option
                  key={cat._id || cat.legacyId}
                  value={cat._id || cat.legacyId}
                >
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-xs font-medium">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tags</label>
            <input
              type="text"
              placeholder="politics, breaking, economy"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("tags")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Cover Image
            </label>
            {coverImageUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer text-white text-sm font-medium bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
                  <p className="text-xs text-slate-500 font-medium">
                    Click to upload cover image
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Excerpt
            </label>
            <textarea
              placeholder="Short article summary..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              {...register("excerpt")}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 mt-auto">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit((data) => onSubmit(data))}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
