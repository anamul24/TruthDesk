"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Image as ImageIcon, Link2, Settings, Hash, Sparkles, Send, Save } from "lucide-react";
import SourceManager from "./SourceManager";
import MediaLibraryModal from "./MediaLibraryModal";

function AccordionItem({ title, icon: Icon, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-5 bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
          {Icon && <Icon size={16} className="text-slate-400" />}
          {title}
        </span>
        {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-1 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default function EditorSidebar({ 
  register, 
  errors, 
  categories, 
  watch, 
  setValue, 
  coverImageUrl, 
  setCoverImageUrl,
  isSubmitting,
  onSubmit
}) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 w-full lg:w-80 flex-shrink-0">
      
      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto">
        <AccordionItem title="Metadata" icon={Settings} defaultOpen={true}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Language</label>
            <select 
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              {...register("language")}
            >
              <option value="en">English</option>
              <option value="bn">Bangla</option>
              <option value="both">Bilingual / Both</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              {...register("categoryId")}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.legacyId} value={cat._id || cat.legacyId}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-500 text-xs font-medium">{errors.categoryId.message}</p>}
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 mt-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Top News</p>
              <p className="text-[10px] text-amber-600 mt-0.5 leading-tight">
                Request placement in Top News section.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setValue("isTopNews", !watch("isTopNews"))}
              className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ${
                watch("isTopNews") ? "bg-amber-500" : "bg-slate-300"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                watch("isTopNews") ? "translate-x-4" : "translate-x-0"
              }`} />
            </button>
          </div>
        </AccordionItem>

        <AccordionItem title="Media" icon={ImageIcon} defaultOpen={true}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Cover Image</label>
            {coverImageUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="text-white text-xs font-medium bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <ImageIcon className="w-6 h-6 mb-2 text-slate-400" />
                <p className="text-xs text-slate-500 font-medium">Add cover image</p>
              </button>
            )}
          </div>
        </AccordionItem>

        <AccordionItem title="SEO & Tags" icon={Hash}>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Tags</label>
              <input
                type="text"
                placeholder="Comma separated..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("tags")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">SEO Title</label>
              <input
                type="text"
                placeholder="Optional custom title..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("seo.title")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Meta Description</label>
              <textarea
                placeholder="Short summary for search engines..."
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                {...register("seo.description")}
              />
            </div>
          </div>
        </AccordionItem>

        <AccordionItem title="Sources" icon={Link2}>
          <SourceManager />
        </AccordionItem>

        <AccordionItem title="AI Assistant" icon={Sparkles}>
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-4 rounded-xl text-center space-y-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Sparkles size={20} className="text-indigo-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Editorial Assistant</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate SEO titles, extract tags, or check readability.
            </p>
            <button type="button" className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
              Analyze Draft
            </button>
          </div>
        </AccordionItem>
      </div>

      {/* Action Buttons Pinned to Bottom */}
      <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onSubmit("submit")}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70"
        >
          <Send size={18} />
          Submit for Review
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onSubmit("draft")}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70"
        >
          <Save size={18} />
          Save Draft
        </button>
      </div>

      <MediaLibraryModal 
        isOpen={isMediaModalOpen} 
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          setCoverImageUrl(url);
          setIsMediaModalOpen(false);
        }}
      />
    </div>
  );
}
