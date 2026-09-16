"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Search, Filter, HardDrive, Trash2, Video, FileText, CheckCircle2 } from "lucide-react";

export default function MediaGovernance() {
  const [activeTab, setActiveTab] = useState("all");

  const mediaFiles = [
    { id: "1", name: "summit_header.jpg", type: "IMAGE", size: "2.4 MB", used: true, date: "2024-03-10" },
    { id: "2", name: "election_results.mp4", type: "VIDEO", size: "14.5 MB", used: true, date: "2024-03-09" },
    { id: "3", name: "budget_draft_v2.pdf", type: "DOCUMENT", size: "1.2 MB", used: false, date: "2024-03-08" },
    { id: "4", name: "placeholder_old.png", type: "IMAGE", size: "0.8 MB", used: false, date: "2024-02-15" },
    { id: "5", name: "interview_clip.mp4", type: "VIDEO", size: "45.2 MB", used: true, date: "2024-03-01" },
  ];

  const filteredMedia = activeTab === "all" ? mediaFiles :
                        activeTab === "unused" ? mediaFiles.filter(m => !m.used) :
                        mediaFiles.filter(m => m.type === activeTab.toUpperCase());

  const getIcon = (type) => {
    switch(type) {
      case "IMAGE": return <ImageIcon size={24} className="text-blue-500" />;
      case "VIDEO": return <Video size={24} className="text-purple-500" />;
      case "DOCUMENT": return <FileText size={24} className="text-orange-500" />;
      default: return <HardDrive size={24} className="text-slate-500" />;
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
            <HardDrive className="text-blue-600" size={32} />
            Media Governance
          </h1>
          <p className="text-slate-500 mt-2">Manage global assets, optimize storage, and clear unused files.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 text-sm font-medium">
          <span className="text-slate-500">Storage Used:</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-[45%] h-full bg-blue-500"></div>
            </div>
            <span className="text-slate-900">45% (225 GB)</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search assets by name or type..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab('all')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`}>All Assets</button>
          <button onClick={() => setActiveTab('image')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'image' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`}>Images</button>
          <button onClick={() => setActiveTab('video')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'video' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-200'}`}>Videos</button>
          <button onClick={() => setActiveTab('unused')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'unused' ? 'bg-white shadow-sm text-red-600' : 'text-slate-600 hover:bg-slate-200'}`}>Unused</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider font-semibold text-slate-500">
              <th className="px-6 py-4 w-1/2">File</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date Uploaded</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMedia.map(file => (
              <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      {getIcon(file.type)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm line-clamp-1">{file.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{file.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                  {file.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {file.used ? (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center w-fit gap-1">
                      <CheckCircle2 size={12} /> In Use
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Unused
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {file.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {activeTab === 'unused' && filteredMedia.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm">
              <Trash2 size={16} /> Delete All Unused ({filteredMedia.length})
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
