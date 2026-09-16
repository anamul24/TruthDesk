import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import StatsCard from "@/components/newsroom/StatsCard";
import { BarChart3, TrendingUp, Users, Clock, Filter, Share2, MousePointerClick } from "lucide-react";

export default async function GlobalAnalytics() {
  await requireRole([USER_ROLES.ADMIN]);

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
            <BarChart3 className="text-indigo-600" size={32} />
            Global Analytics
          </h1>
          <p className="text-slate-500 mt-2">Deep dive into traffic, content performance, and engagement.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Today</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-slate-900 text-white shadow-sm">7 Days</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">30 Days</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">90 Days</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-1"><Filter size={14} /> Custom</button>
        </div>
      </div>

      {/* High Level */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Page Views" value="842.5K" icon="TrendingUp" color="blue" />
        <StatsCard label="Unique Visitors" value="312.1K" icon="Users" color="indigo" />
        <StatsCard label="Avg. Time on Page" value="2m 45s" icon="Clock" color="green" />
        <StatsCard label="Bounce Rate" value="42.3%" icon="MousePointerClick" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Top Performing Articles</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {[1,2,3,4,5].map((item) => (
              <div key={item} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                <div className="text-lg font-black text-slate-300 w-6 text-center">{item}</div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">Government Announces New Infrastructure Budget</h3>
                  <div className="text-xs text-slate-500 mt-1 flex gap-3">
                    <span>By Jane Smith</span>
                    <span className="text-blue-600 font-medium">124K views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Top Categories</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="font-bold">Politics</span><span className="text-slate-500">45%</span></div>
              <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-indigo-600 h-2.5 rounded-full" style={{width: '45%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="font-bold">Business</span><span className="text-slate-500">25%</span></div>
              <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{width: '25%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="font-bold">Sports</span><span className="text-slate-500">15%</span></div>
              <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-green-500 h-2.5 rounded-full" style={{width: '15%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="font-bold">Entertainment</span><span className="text-slate-500">10%</span></div>
              <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-orange-400 h-2.5 rounded-full" style={{width: '10%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="font-bold">Technology</span><span className="text-slate-500">5%</span></div>
              <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-slate-400 h-2.5 rounded-full" style={{width: '5%'}}></div></div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
