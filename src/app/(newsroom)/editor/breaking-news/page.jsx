"use client";

import React, { useState, useEffect } from "react";
import { Radio, AlertCircle, Plus, Clock, Trash2, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function BreakingNewsManager() {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [headline, setHeadline] = useState("");
  const [duration, setDuration] = useState("1");
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertsRes, articlesRes] = await Promise.all([
        fetch("/api/breaking-news"),
        fetch("/api/articles?status=PUBLISHED")
      ]);
      
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setActiveAlerts(data.items || []);
      }
      
      if (articlesRes.ok) {
        const data = await articlesRes.json();
        setPublishedArticles(data.articles || []);
      }
    } catch (err) {
      toast.error("Failed to fetch breaking news data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!headline || headline.trim().length < 3) {
      toast.error("Headline is required (min 3 chars)");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Creating alert...");
    
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(duration, 10));
      
      let url = null;
      if (selectedArticleId) {
        const article = publishedArticles.find(a => String(a._id) === selectedArticleId);
        if (article) {
          url = `/news/${article.slug}`;
        }
      }

      const res = await fetch("/api/breaking-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: headline.trim(),
          url,
          expiresAt: expiresAt.toISOString(),
          isActive: true
        })
      });

      if (!res.ok) throw new Error("Failed to create alert");
      
      toast.success("Alert published successfully", { id: toastId });
      setIsModalOpen(false);
      
      // Reset form
      setHeadline("");
      setDuration("1");
      setSelectedArticleId("");
      setSearchTerm("");
      
      fetchData();
    } catch (err) {
      toast.error("Failed to create alert", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    const toastId = toast.loading("Deactivating alert...");
    try {
      // Set expiresAt to now
      const res = await fetch(`/api/breaking-news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresAt: new Date().toISOString() })
      });

      if (!res.ok) throw new Error("Failed to deactivate");
      
      toast.success("Alert deactivated", { id: toastId });
      fetchData();
    } catch (err) {
      toast.error("Failed to deactivate alert", { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;
    
    const toastId = toast.loading("Deleting alert...");
    try {
      const res = await fetch(`/api/breaking-news/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete");
      
      toast.success("Alert deleted", { id: toastId });
      fetchData();
    } catch (err) {
      toast.error("Failed to delete alert", { id: toastId });
    }
  };

  const filteredArticles = publishedArticles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
            <Radio className="text-red-600 animate-pulse" size={32} />
            Breaking News
          </h1>
          <p className="text-slate-500 mt-2">Manage live alerts across the platform.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Alert
        </button>
      </div>

      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Active Alerts
        </h2>
        <div className="space-y-4">
          {activeAlerts.map(alert => {
            const isExpired = alert.expiresAt && new Date(alert.expiresAt) <= new Date();
            if (isExpired) return null; // Or you could show them grayed out
            
            return (
              <div key={alert._id} className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-red-700 flex items-center gap-1">
                        <Clock size={12} /> {alert.expiresAt ? `Expires at ${format(new Date(alert.expiresAt), "h:mm a")}` : "No expiry"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{alert.text}</h3>
                    {alert.url && (
                      <p className="text-sm text-red-600 mt-1">Linked to: {alert.url}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 shrink-0 self-start">
                    <button 
                      onClick={() => handleDeactivate(alert._id)}
                      className="px-3 py-1.5 bg-white text-slate-700 font-medium text-sm hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                      Deactivate
                    </button>
                    <button 
                      onClick={() => handleDelete(alert._id)}
                      className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {activeAlerts.filter(a => !a.expiresAt || new Date(a.expiresAt) > new Date()).length === 0 && (
            <div className="bg-white border border-slate-200 p-8 rounded-xl text-center">
              <p className="text-slate-500">No active breaking news alerts.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal for creating a new alert */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Create Breaking Alert</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <AlertCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Headline</label>
                <input 
                  type="text" 
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                  placeholder="E.g., Major Earthquake Hits..." 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Duration</label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="1">1 Hour</option>
                  <option value="3">3 Hours</option>
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Link to Article (Optional)</label>
                <div className="border border-slate-300 rounded-lg p-2 max-h-60 flex flex-col">
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search published articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-red-400"
                    />
                  </div>
                  
                  <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                    <div 
                      onClick={() => setSelectedArticleId("")}
                      className={`p-2 rounded text-sm cursor-pointer ${!selectedArticleId ? 'bg-red-50 text-red-700 font-medium' : 'hover:bg-slate-50'}`}
                    >
                      None (Text Only)
                    </div>
                    {filteredArticles.map(article => (
                      <div 
                        key={article._id}
                        onClick={() => {
                          setSelectedArticleId(article._id);
                          if (!headline) setHeadline(article.title);
                        }}
                        className={`p-2 rounded text-sm cursor-pointer line-clamp-1 ${selectedArticleId === String(article._id) ? 'bg-red-50 text-red-700 font-medium' : 'hover:bg-slate-50'}`}
                      >
                        {article.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Publish Alert
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
