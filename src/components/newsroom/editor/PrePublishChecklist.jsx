"use client";

import React, { useState } from "react";
import { X, CheckCircle, AlertTriangle, Send } from "lucide-react";

export default function PrePublishChecklist({ isOpen, onClose, onPublish, article }) {
  const [checks, setChecks] = useState({
    headline: false,
    category: false,
    image: false,
    sources: false,
    seo: false,
    factcheck: false,
  });

  if (!isOpen) return null;

  const toggleCheck = (key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Pre-Publish Checklist</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex gap-3 text-sm text-amber-800 mb-6">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p>Please confirm these editorial standards before pushing this article live.</p>
          </div>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked={checks.headline} onChange={() => toggleCheck("headline")} className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Headline & Summary</p>
              <p className="text-xs text-slate-500">Headline is catchy, accurate, and free of typos.</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked={checks.category} onChange={() => toggleCheck("category")} className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Category & Tags</p>
              <p className="text-xs text-slate-500">Assigned to correct section with relevant tags.</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked={checks.image} onChange={() => toggleCheck("image")} className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Featured Image</p>
              <p className="text-xs text-slate-500">High-quality image with accurate alt text and credits.</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked={checks.seo} onChange={() => toggleCheck("seo")} className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">SEO Metadata</p>
              <p className="text-xs text-slate-500">SEO title and description are optimized.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked={checks.factcheck} onChange={() => toggleCheck("factcheck")} className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Fact Check Passed</p>
              <p className="text-xs text-slate-500">All claims and sources have been verified.</p>
            </div>
          </label>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
          <p className="text-xs text-slate-500 text-center mb-1">
            Publishing will push the article to the live Website immediately.
          </p>
          <button 
            onClick={() => onPublish({ checks })}
            disabled={!allChecked}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} /> Confirm & Publish
          </button>
        </div>
      </div>
    </div>
  );
}
