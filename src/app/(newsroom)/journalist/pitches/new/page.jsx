"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Send, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const pitchSchema = z.object({
  title: z.string().min(5, "Title is required").max(200),
  description: z.string().min(20, "Please provide more details for the pitch"),
  categoryId: z.string().min(1, "Category is required"),
  urgency: z.enum(["NORMAL", "HIGH", "BREAKING"]).default("NORMAL"),
});

export default function NewPitchPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock categories (in a real app, fetch these from API)
  const categories = [
    { _id: "cat_1", name: "Politics" },
    { _id: "cat_2", name: "Economy" },
    { _id: "cat_3", name: "Sports" },
    { _id: "cat_4", name: "International" },
  ];

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(pitchSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      urgency: "NORMAL",
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Submitting pitch...");

    try {
      const res = await fetch("/api/pitches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to submit pitch");

      toast.success("Pitch submitted successfully!", { id: toastId });
      router.push("/journalist/pitches");
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-3xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-serif">Submit a Pitch</h1>
        <p className="text-slate-500 mt-2">Have a story idea? Submit it for editorial review.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Story Title / Headline</label>
            <input 
              type="text" 
              placeholder="E.g., Investigation into local supply chain disruptions"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              {...register("title")}
            />
            {errors.title && <p className="text-red-500 text-xs font-medium mt-1">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Story Brief & Angle</label>
            <textarea 
              rows={5}
              placeholder="Explain the story, why it matters now, and how you plan to cover it..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-y"
              {...register("description")}
            />
            {errors.description && <p className="text-red-500 text-xs font-medium mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Category</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                {...register("categoryId")}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs font-medium mt-1">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Urgency</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                {...register("urgency")}
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority</option>
                <option value="BREAKING">Breaking News</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mt-8">
            <AlertCircle size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-800">
              Approved pitches will automatically be added to your assignments. You will receive a notification when an editor reviews your pitch.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70"
            >
              <Send size={18} />
              Submit Pitch
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
