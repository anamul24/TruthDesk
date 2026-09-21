"use client";

import React, { useState, useEffect } from "react";
import { Layout, GripVertical, Star, Settings, Image as ImageIcon, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function HomepageCuration() {
  const [heroStories, setHeroStories] = useState([]);
  const [topNews, setTopNews] = useState([]);
  const [availableStories, setAvailableStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [configRes, articlesRes] = await Promise.all([
          fetch("/api/homepage"),
          fetch("/api/articles?status=PUBLISHED")
        ]);

        if (configRes.ok && articlesRes.ok) {
          const config = await configRes.json();
          const { articles } = await articlesRes.json();
          
          setAvailableStories(articles || []);
          
          // Map stored IDs to actual article data
          const mapIdsToArticles = (ids) => {
            if (!Array.isArray(ids)) return [];
            return ids
              .map(id => articles.find(a => String(a._id) === String(id)))
              .filter(Boolean);
          };
          
          setHeroStories(mapIdsToArticles(config.heroStories));
          setTopNews(mapIdsToArticles(config.topNews));
        } else {
          toast.error("Failed to load homepage configuration");
        }
      } catch (err) {
        toast.error("An error occurred while loading data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePublish = async () => {
    setSaving(true);
    const toastId = toast.loading("Publishing changes...");
    try {
      const payload = {
        heroStories: heroStories.map(s => s._id),
        topNews: topNews.map(s => s._id)
      };

      const res = await fetch("/api/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save");
      
      toast.success("Homepage updated successfully", { id: toastId });
    } catch (err) {
      toast.error("Failed to publish changes", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (id, listType) => {
    if (listType === 'hero') {
      setHeroStories(prev => prev.filter(s => s._id !== id));
    } else {
      setTopNews(prev => prev.filter(s => s._id !== id));
    }
  };

  const handleAdd = (article, listType) => {
    if (listType === 'hero') {
      if (!heroStories.some(s => s._id === article._id)) {
        setHeroStories(prev => [...prev, article]);
      }
    } else {
      if (!topNews.some(s => s._id === article._id)) {
        setTopNews(prev => [...prev, article]);
      }
    }
  };

  const filteredStories = availableStories.filter(story => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

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
          <button 
            onClick={handlePublish}
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
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
                  <Star size={18} className="text-yellow-500" /> Hero Story ({heroStories.length})
                </h3>
              </div>
              
              <div className="min-h-[120px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-3 flex flex-col gap-2">
                {heroStories.map(story => (
                  <div key={story._id} className="bg-white border border-slate-200 p-4 rounded-lg flex items-start gap-4 shadow-sm group relative">
                    <button className="mt-1 text-slate-400 cursor-grab active:cursor-grabbing"><GripVertical size={20} /></button>
                    {story.coverImage?.url ? (
                      <img src={story.coverImage.url} alt="" className="w-24 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-24 h-16 bg-slate-200 rounded flex items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon size={20} />
                      </div>
                    )}
                    <div className="flex-1 pr-12">
                      <h4 className="font-bold text-slate-900 leading-tight mt-1">{story.title}</h4>
                    </div>
                    <button 
                      onClick={() => handleRemove(story._id, 'hero')}
                      className="absolute right-4 top-4 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {heroStories.length === 0 && (
                  <div className="text-center text-slate-400 py-8 text-sm">
                    No hero stories selected. Add from available stories.
                  </div>
                )}
              </div>
            </section>

            {/* Top News Section */}
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Layout size={18} className="text-blue-500" /> Top News ({topNews.length})
                </h3>
              </div>
              
              <div className="min-h-[200px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-3 flex flex-col gap-2">
                {topNews.map(story => (
                  <div key={story._id} className="bg-white border border-slate-200 p-3 rounded-lg flex items-center gap-3 shadow-sm group relative">
                    <button className="text-slate-400 cursor-grab active:cursor-grabbing"><GripVertical size={18} /></button>
                    {story.coverImage?.url ? (
                      <img src={story.coverImage.url} alt="" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon size={16} />
                      </div>
                    )}
                    <div className="flex-1 pr-12">
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{story.title}</h4>
                    </div>
                    <button 
                      onClick={() => handleRemove(story._id, 'top')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {topNews.length === 0 && (
                  <div className="text-center text-slate-400 py-8 text-sm">
                    No top news selected. Add from available stories.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Sidebar: Available Stories */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 mb-3">Available Published Stories</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search published stories..." 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredStories.map(story => (
              <div key={story._id} className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors bg-slate-50 relative group">
                <h4 className="font-semibold text-slate-900 text-sm mt-1 line-clamp-2 pr-12">{story.title}</h4>
                <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleAdd(story, 'hero')} className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-1 rounded font-bold hover:bg-yellow-200">
                    + Hero
                  </button>
                  <button onClick={() => handleAdd(story, 'top')} className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded font-bold hover:bg-blue-200">
                    + Top
                  </button>
                </div>
              </div>
            ))}
            {filteredStories.length === 0 && (
              <div className="text-center text-slate-400 py-8 text-sm">
                No articles found.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
