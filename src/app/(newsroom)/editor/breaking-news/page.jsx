"use client";

import React, { useState } from "react";
import { Radio, AlertCircle, Plus, Calendar, Clock, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function BreakingNewsManager() {
  const [activeAlerts, setActiveAlerts] = useState([
    {
      _id: "1",
      headline: "Major Policy Shift Announced by Central Bank",
      priority: "CRITICAL",
      isActive: true,
      expiryTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      createdAt: new Date().toISOString()
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          {activeAlerts.filter(a => a.isActive).map(alert => (
            <div key={alert._id} className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                      {alert.priority}
                    </span>
                    <span className="text-xs font-medium text-red-700 flex items-center gap-1">
                      <Clock size={12} /> Expires at {format(new Date(alert.expiryTime), "h:mm a")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{alert.headline}</h3>
                </div>
                
                <div className="flex gap-2 shrink-0 self-start">
                  <button className="p-2 bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                    <Edit2 size={16} />
                  </button>
                  <button className="px-3 py-1.5 bg-white text-slate-700 font-medium text-sm hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          ))}
          {activeAlerts.filter(a => a.isActive).length === 0 && (
            <div className="bg-white border border-slate-200 p-8 rounded-xl text-center">
              <p className="text-slate-500">No active breaking news alerts.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal would go here for creating a new alert */}
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
                <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="E.g., Major Earthquake Hits..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
                  <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none">
                    <option>HIGH</option>
                    <option>CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Duration</label>
                  <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none">
                    <option>1 Hour</option>
                    <option>3 Hours</option>
                    <option>12 Hours</option>
                    <option>24 Hours</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Link to Article (Optional)</label>
                <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Paste URL..." />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg shadow-sm">Publish Alert</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
