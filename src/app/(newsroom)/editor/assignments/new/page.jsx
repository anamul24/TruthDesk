"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckSquare, ArrowLeft, Calendar, AlertTriangle,
  Users, FileText, Send, Loader2, AlarmClock
} from "lucide-react";
import { toast } from "sonner";

const PRIORITY_OPTIONS = [
  { value: "NORMAL", label: "Normal", color: "text-slate-600 bg-slate-50 border-slate-200" },
  { value: "URGENT", label: "Urgent", color: "text-orange-700 bg-orange-50 border-orange-200" },
  { value: "BREAKING", label: "Breaking", color: "text-red-700 bg-red-50 border-red-200" },
];

export default function NewAssignmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    journalistId: "",
    journalistName: "",
    priority: "NORMAL",
    deadline: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Story title is required.";
    if (!form.journalistId.trim()) newErrors.journalistId = "Please assign a journalist.";
    if (!form.deadline) newErrors.deadline = "Deadline is required.";
    else if (new Date(form.deadline) <= new Date()) newErrors.deadline = "Deadline must be in the future.";
    return newErrors;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          journalistId: form.journalistId,
          journalistName: form.journalistName,
          priority: form.priority,
          deadline: new Date(form.deadline).toISOString(),
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Assignment created successfully!");
        router.push("/editor/assignments");
      } else {
        toast.error(data.error || "Failed to create assignment.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-3xl mx-auto space-y-8 font-sans">

      {/* Back */}
      <Link
        href="/editor/assignments"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Assignments
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
          <CheckSquare className="text-blue-600" size={32} />
          New Assignment
        </h1>
        <p className="text-slate-500 mt-2">Assign a story brief to a journalist with a deadline and priority level.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Story Brief */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText size={16} className="text-slate-500" /> Story Brief
          </h2>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Story Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Investigation into city council budget mismanagement"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.title ? "border-red-400 bg-red-50" : "border-slate-200"}`}
            />
            {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description / Brief
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Provide context, background, key angles and what you need from the journalist..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Additional Notes (optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Sources to contact, style guidelines, related links..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Assignment Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users size={16} className="text-slate-500" /> Assignment Details
          </h2>

          {/* Journalist */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Journalist ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="journalistId"
              value={form.journalistId}
              onChange={handleChange}
              placeholder="Enter journalist user ID"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.journalistId ? "border-red-400 bg-red-50" : "border-slate-200"}`}
            />
            {errors.journalistId && <p className="text-red-600 text-xs mt-1">{errors.journalistId}</p>}
            <p className="text-xs text-slate-400 mt-1">
              You can find journalist IDs on the{" "}
              <Link href="/admin/users" className="text-blue-500 hover:underline">Users page</Link>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Journalist Name (display)
            </label>
            <input
              type="text"
              name="journalistName"
              value={form.journalistName}
              onChange={handleChange}
              placeholder="e.g. Rafiq Ahmed"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Priority
            </label>
            <div className="flex gap-3">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, priority: opt.value }))}
                  className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider border rounded-lg transition-all ${
                    form.priority === opt.value
                      ? opt.color + " ring-2 ring-offset-1 ring-blue-400"
                      : "text-slate-500 bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Deadline <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <AlarmClock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="datetime-local"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.deadline ? "border-red-400 bg-red-50" : "border-slate-200"}`}
              />
            </div>
            {errors.deadline && <p className="text-red-600 text-xs mt-1">{errors.deadline}</p>}
          </div>
        </div>

        {/* Warning if BREAKING */}
        {form.priority === "BREAKING" && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p>
              <strong>Breaking Priority</strong> — The journalist will be immediately notified and this story
              will be marked as highest urgency. Ensure the deadline is accurate.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/editor/assignments"
            className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Creating...</>
            ) : (
              <><Send size={16} /> Create Assignment</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
