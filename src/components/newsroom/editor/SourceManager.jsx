"use client";

import React, { useState } from "react";
import { Link2, FileText, CheckCircle, AlertCircle, Plus, Trash2 } from "lucide-react";

export default function SourceManager() {
  const [sources, setSources] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newSource, setNewSource] = useState({
    title: "",
    url: "",
    note: ""
  });

  const handleAdd = () => {
    if (!newSource.title) return;
    setSources([...sources, { ...newSource, id: Date.now(), verificationStatus: "UNVERIFIED" }]);
    setNewSource({ title: "", url: "", note: "" });
    setIsAdding(false);
  };

  const removeSource = (id) => {
    setSources(sources.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      {sources.length > 0 ? (
        <div className="space-y-3">
          {sources.map(source => (
            <div key={source.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 font-semibold text-slate-800 line-clamp-1">{source.title}</div>
                <button onClick={() => removeSource(source.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={14} />
                </button>
              </div>
              {source.url && (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 truncate">
                  <Link2 size={12} /> {source.url}
                </a>
              )}
              {source.note && <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">"{source.note}"</p>}
              <div className="mt-2 flex items-center gap-1 text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm inline-flex">
                <AlertCircle size={10} /> Unverified
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 border border-dashed border-slate-200 rounded-lg">
          <FileText size={20} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-500">No sources attached yet.</p>
        </div>
      )}

      {isAdding ? (
        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3">
          <input 
            type="text" 
            placeholder="Source Title (e.g., Police Report)" 
            className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
            value={newSource.title}
            onChange={(e) => setNewSource({...newSource, title: e.target.value})}
          />
          <input 
            type="url" 
            placeholder="URL (optional)" 
            className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
            value={newSource.url}
            onChange={(e) => setNewSource({...newSource, url: e.target.value})}
          />
          <textarea 
            placeholder="Notes or exact quote..." 
            rows={2}
            className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 resize-none"
            value={newSource.note}
            onChange={(e) => setNewSource({...newSource, note: e.target.value})}
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 bg-slate-900 text-white text-xs font-medium py-1.5 rounded-md hover:bg-slate-800">Add</button>
            <button onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-600 text-xs font-medium py-1.5 rounded-md hover:bg-slate-200">Cancel</button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Plus size={16} /> Add Source
        </button>
      )}
    </div>
  );
}
