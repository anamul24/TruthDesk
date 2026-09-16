"use client";

import React, { useState, useEffect } from "react";
import { Search, FileText, PenSquare, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    { label: "Write New Story", href: "/journalist/write", icon: PenSquare },
    { label: "View All Stories", href: "/journalist/articles", icon: FileText },
    // More will be added later
  ];

  const handleSelect = (href) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search size={20} className="text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search articles, assignments, or actions..."
            className="flex-1 bg-transparent border-none outline-none px-4 text-slate-800 placeholder:text-slate-400 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <span className="text-xs font-medium px-1">ESC</span>
          </button>
        </div>

        {/* Results / Actions */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quick Actions
          </div>
          <div className="space-y-1">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.href}
                  onClick={() => handleSelect(action.href)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors text-left"
                >
                  <Icon size={18} className="text-slate-400" />
                  <span className="font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
