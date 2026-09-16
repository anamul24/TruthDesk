"use client";

import React, { useState } from "react";
import { X, Image as ImageIcon, Search, UploadCloud } from "lucide-react";

export default function MediaLibraryModal({ isOpen, onClose, onSelect }) {
  const [activeTab, setActiveTab] = useState("library"); // library or upload

  if (!isOpen) return null;

  // Placeholder images
  const MOCK_MEDIA = [
    { id: 1, url: "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94", alt: "News Event", filename: "event-1.jpg" },
    { id: 2, url: "https://images.unsplash.com/photo-1541872579124-749e7943ff78", alt: "Politics", filename: "politics.jpg" },
    { id: 3, url: "https://images.unsplash.com/photo-1611095973763-414019e72400", alt: "Economy", filename: "economy-chart.jpg" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Media Library</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-slate-100">
            <div className="p-4 border-b border-slate-100 flex gap-4">
              <button 
                onClick={() => setActiveTab("library")}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${activeTab === "library" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                My Library
              </button>
              <button 
                onClick={() => setActiveTab("upload")}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${activeTab === "upload" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                Upload New
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {activeTab === "library" ? (
                <div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200 mb-6 shadow-sm">
                    <Search size={18} className="text-slate-400" />
                    <input type="text" placeholder="Search media..." className="flex-1 bg-transparent border-none outline-none text-sm" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {MOCK_MEDIA.map(media => (
                      <div 
                        key={media.id} 
                        className="group relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                        onClick={() => onSelect(media.url)}
                      >
                        <img src={media.url} alt={media.alt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center border-2 border-dashed border-slate-300 rounded-2xl p-10 bg-white">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud size={28} className="text-blue-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Drag & Drop</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-6">or click to browse files from your computer.</p>
                  <button className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors">
                    Browse Files
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
