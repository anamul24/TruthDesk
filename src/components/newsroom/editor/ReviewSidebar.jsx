"use client";

import React, { useState } from "react";
import { MessageSquare, GitCommit, FileText, CheckCircle, AlertCircle, Calendar, Send, Info } from "lucide-react";
import PrePublishChecklist from "./PrePublishChecklist";
import { toast } from "sonner";

export default function ReviewSidebar({ article }) {
  const [activeTab, setActiveTab] = useState("actions");
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleAction = async (action) => {
    if (action === "publish") {
      setIsChecklistOpen(true);
      return;
    }
    
    // Mock actions
    toast.success(`Action "${action}" triggered`);
  };

  const handlePublish = async (publishData) => {
    setIsChecklistOpen(false);
    toast.success("Article has been scheduled for publication!");
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 w-full lg:w-96 flex-shrink-0">
      
      {/* Tabs */}
      <div className="flex bg-slate-50 border-b border-slate-200 p-2 gap-1">
        <button 
          onClick={() => setActiveTab("actions")}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'actions' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
        >
          <CheckCircle size={18} className="mb-1" />
          Actions
        </button>
        <button 
          onClick={() => setActiveTab("comments")}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'comments' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
        >
          <MessageSquare size={18} className="mb-1" />
          Comments
        </button>
        <button 
          onClick={() => setActiveTab("factcheck")}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'factcheck' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
        >
          <FileText size={18} className="mb-1" />
          Fact Check
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'history' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
        >
          <GitCommit size={18} className="mb-1" />
          History
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5">
        
        {activeTab === "actions" && (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
              <Info size={20} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-indigo-900">Document Locked</h4>
                <p className="text-xs text-indigo-700 mt-1">You are currently the only one who can edit or review this document.</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Review Decision</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleAction("request_changes")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white border-2 border-orange-200 text-orange-700 rounded-xl hover:bg-orange-50 transition-colors font-semibold text-sm"
                >
                  <AlertCircle size={18} /> Request Changes
                </button>
                <button 
                  onClick={() => handleAction("approve")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white border-2 border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition-colors font-semibold text-sm"
                >
                  <CheckCircle size={18} /> Approve Draft
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Publishing</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleAction("publish")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-semibold text-sm shadow-sm"
                >
                  <Send size={18} /> Publish Now
                </button>
                <button 
                  onClick={() => handleAction("schedule")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm shadow-sm"
                >
                  <Calendar size={18} /> Schedule for Later
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-900">Jane Smith</span>
                  <span className="text-[10px] text-slate-500 font-medium">2 hours ago</span>
                </div>
                <p className="text-slate-700">Can we rephrase the opening paragraph to be more punchy?</p>
                <div className="mt-2 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded inline-flex">Open</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200">
              <textarea 
                placeholder="Leave an inline comment..." 
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button 
                className="w-full mt-2 bg-slate-900 text-white font-medium text-sm py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Add Comment
              </button>
            </div>
          </div>
        )}

        {activeTab === "factcheck" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Attach verification notes to sources used in this article.</p>
            <div className="p-4 border border-slate-200 rounded-xl space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Police Report PDF</h4>
              <a href="#" className="text-xs text-blue-600 hover:underline">View Source</a>
              <select className="w-full text-sm p-2 rounded-md border border-slate-200 mt-2">
                <option value="UNVERIFIED">Unverified</option>
                <option value="VERIFIED">Verified</option>
                <option value="CONFLICTING">Conflicting Evidence</option>
              </select>
              <textarea placeholder="Fact-check notes..." className="w-full text-sm p-2 border border-slate-200 rounded-md mt-2 resize-none" rows={2}></textarea>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="relative border-l-2 border-slate-200 ml-3 py-2 space-y-6">
              <div className="relative pl-6">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-green-500 ring-4 ring-white" />
                <p className="text-xs font-bold text-slate-500 uppercase">Today, 2:30 PM</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">Version 3</p>
                <p className="text-xs text-slate-500 mt-0.5">By Jane Smith (Resubmission)</p>
                <button className="text-xs text-blue-600 font-medium mt-1">Compare</button>
              </div>
              <div className="relative pl-6 opacity-70">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white" />
                <p className="text-xs font-bold text-slate-500 uppercase">Today, 10:15 AM</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">Version 2</p>
                <p className="text-xs text-slate-500 mt-0.5">By Editor (Requested Changes)</p>
              </div>
              <div className="relative pl-6 opacity-70">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white" />
                <p className="text-xs font-bold text-slate-500 uppercase">Yesterday</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">Version 1</p>
                <p className="text-xs text-slate-500 mt-0.5">By Jane Smith (Initial Draft)</p>
              </div>
            </div>
          </div>
        )}

      </div>
      
      <PrePublishChecklist 
        isOpen={isChecklistOpen} 
        onClose={() => setIsChecklistOpen(false)} 
        onPublish={handlePublish}
        article={article}
      />
    </div>
  );
}
