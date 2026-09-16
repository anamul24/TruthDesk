"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Cloud, Check } from "lucide-react";
import Link from "next/link";
import TiptapEditor from "@/components/newsroom/TiptapEditor";
import EditorSidebar from "@/components/newsroom/editor/EditorSidebar";

const formSchema = z.object({
  title: z.string().min(5, "Headline must be at least 5 characters").max(300),
  subtitle: z.string().max(500).optional(),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  excerpt: z.string().max(1000).optional(),
  isTopNews: z.boolean().optional().default(false),
  language: z.enum(["en", "bn", "both"]).optional().default("en"),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    slug: z.string().optional(),
  }).optional()
});

export default function WriteStoryPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved, error

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      categoryId: "",
      tags: "",
      excerpt: "",
      isTopNews: false,
      language: "en",
    },
  });

  // Watch for changes to trigger autosave indicator
  const title = watch("title");
  
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    }
    loadCategories();
  }, []);

  // Simple autosave visual effect (actual save omitted for now)
  useEffect(() => {
    if (title || content) {
      setSaveStatus("saving");
      const timeout = setTimeout(() => {
        setSaveStatus("saved");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [title, content]);

  const onSubmitHandler = async (action) => {
    return handleSubmit(async (data) => {
      if (!content || (content.content && content.content.length === 0)) {
        toast.error("Article content cannot be empty");
        return;
      }

      setIsSubmitting(true);
      const toastId = toast.loading(
        action === "draft" ? "Saving draft..." : "Submitting article..."
      );

      try {
        const payload = {
          ...data,
          content,
          tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
          coverImage: { url: coverImageUrl, alt: data.title },
          isTopNews: data.isTopNews || false,
          action, // 'draft' or 'submit'
        };

        const res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to save article");
        }

        toast.success(
          action === "draft"
            ? "Draft saved successfully"
            : "Article submitted for review",
          { id: toastId }
        );
        
        router.push("/journalist/articles");
      } catch (error) {
        toast.error(error.message, { id: toastId });
      } finally {
        setIsSubmitting(false);
      }
    })(); // Execute the handleSubmit callback
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen bg-slate-50 font-sans">
      {/* Editor Top Bar */}
      <div className="flex-shrink-0 h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/journalist" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2 text-xs font-medium">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Cloud size={14} className="animate-pulse" /> Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-green-600">
                <Check size={14} /> Saved to cloud
              </span>
            )}
            {saveStatus === "idle" && (
              <span className="text-slate-400">New Draft</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">
            Preview
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
          <div className="max-w-3xl mx-auto py-12 px-6 lg:px-12 bg-white min-h-full shadow-sm">
            <form id="article-form" className="space-y-6">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Write your headline..."
                  className="w-full text-4xl md:text-5xl font-black font-serif text-slate-900 placeholder:text-slate-300 focus:outline-none bg-transparent"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm font-medium">{errors.title.message}</p>
                )}

                <input
                  type="text"
                  placeholder="Short description or subtitle..."
                  className="w-full text-xl md:text-2xl font-medium text-slate-600 placeholder:text-slate-300 focus:outline-none bg-transparent"
                  {...register("subtitle")}
                />
                {errors.subtitle && (
                  <p className="text-red-500 text-sm font-medium">{errors.subtitle.message}</p>
                )}
              </div>

              <div className="min-h-[500px] prose prose-slate max-w-none prose-lg">
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your article body..."
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Settings */}
        <EditorSidebar 
          register={register}
          errors={errors}
          categories={categories}
          watch={watch}
          setValue={setValue}
          coverImageUrl={coverImageUrl}
          setCoverImageUrl={setCoverImageUrl}
          isSubmitting={isSubmitting}
          onSubmit={onSubmitHandler}
        />
      </div>
    </div>
  );
}
