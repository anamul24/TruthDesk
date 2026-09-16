"use client";

import React, { useState } from "react";
import { Layout, GripVertical, Star, Settings, Image as ImageIcon, Search } from "lucide-react";

export default function HomepageCuration() {
  const [heroStories, setHeroStories] = useState([
    { id: "1", title: "Global Summit Reaches Historic Climate Agreement After Marathon Negotiations", category: "World" }
  ]);
  
  const [topNews, setTopNews] = useState([
    { id: "2", title: "Tech Giants Announce Unified AI Safety Standards", category: "Technology" },
    { id: "3", title: "Markets Rally on Unexpected Jobs Report Data", category: "Business" },
    { id: "4", title: "New Study Reveals Surprising Health Benefits of Morning Sunlight", category: "Health" }
  ]);

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
            <Layout className="text-indigo-600" size={32} />
            Homepage Curation
          </h1>
          <p className="text-slate-500 mt-2">Design and curate the public-facing homepage layout.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            Preview Layout
          </button>
          <button className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
            Publish Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Layout Editor */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200">
            {/* Hero Section */}
            <section className="bg-white p-5 rounded-xl shadow-sm mb-2 border border-slate-200">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Star size={18} className="text-yellow-500" /> Hero Story (1)
                </h3>
                <button className="text-slate-400 hover:text-slate-600"><Settings size={16} /></button>
              </div>
              
              <div className="min-h-[120px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-3 flex flex-col gap-2">
                {heroStories.map(story => (
                  <div key={story.id} className="bg-white border border-slate-200 p-4 rounded-lg flex items-start gap-4 shadow-sm group">
                    <button className="mt-1 text-slate-400 cursor-grab active:cursor-grabbing"><GripVertical size={20} /></button>
                    <div className="w-24 h-16 bg-slate-200 rounded flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon size={20} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{story.category}</span>
                      <h4 className="font-bold text-slate-900 leading-tight mt-1">{story.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top News Section */}
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Layout size={18} className="text-blue-500" /> Top News (3)
                </h3>
                <button className="text-slate-400 hover:text-slate-600"><Settings size={16} /></button>
              </div>
              
              <div className="min-h-[200px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-3 flex flex-col gap-2">
                {topNews.map(story => (
                  <div key={story.id} className="bg-white border border-slate-200 p-3 rounded-lg flex items-center gap-3 shadow-sm group">
                    <button className="text-slate-400 cursor-grab active:cursor-grabbing"><GripVertical size={18} /></button>
                    <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon size={16} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{story.category}</span>
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{story.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
        </div>

        {/* Sidebar: Available Stories */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 mb-3">Available Stories</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search published stories..." 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors bg-slate-50">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Politics</span>
                <h4 className="font-semibold text-slate-900 text-sm mt-1 line-clamp-2">Local Elections Yield Surprising Results in Suburban Districts</h4>
                <p className="text-xs text-slate-500 mt-2">Published 2 hours ago</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
