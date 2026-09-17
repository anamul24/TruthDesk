"use client";

import React, { useState } from "react";
import { Settings, Globe, Shield, Bell, Type, Save } from "lucide-react";

export default function PlatformSettings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
            <Settings className="text-slate-700" size={32} />
            Platform Settings
          </h1>
          <p className="text-slate-500 mt-2">Configure global platform behavior and editorial rules.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "general" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <Globe size={18} /> General Settings
          </button>
          <button 
            onClick={() => setActiveTab("editorial")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "editorial" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <Type size={18} /> Editorial Workflow
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "notifications" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <Bell size={18} /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === "security" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <Shield size={18} /> Security & Access
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          
          {activeTab === "general" && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">General Settings</h2>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Site Name</label>
                <input type="text" placeholder="Enter Site Name" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Default Interface Language</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>English</option>
                  <option>Bangla</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Timezone</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Asia/Dhaka (GMT+6)</option>
                  <option>UTC (GMT+0)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "editorial" && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Editorial Workflow</h2>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Breaking News Expiry (Default)</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>1 Hour</option>
                  <option>3 Hours</option>
                  <option>24 Hours</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Require Fact-Check for All Submissions</h3>
                  <p className="text-xs text-slate-500 mt-1">If enabled, editors cannot publish without a fact-checker's approval.</p>
                </div>
                <button className="w-11 h-6 bg-slate-300 rounded-full relative transition-colors">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Notifications</h2>
              <p className="text-slate-500 text-sm">System-wide notification defaults.</p>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-700">Email digest for pending reviews</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-700">In-app alerts for Breaking News creation</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Security & Access</h2>
              <p className="text-slate-500 text-sm">Note: Advanced security policies are managed in the Security Center.</p>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Global Password Policy</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Standard (8 chars, 1 number)</option>
                  <option>Strict (12 chars, special, uppercase)</option>
                </select>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
