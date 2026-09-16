import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import StatsCard from "@/components/newsroom/StatsCard";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { Users, FileText, CheckCircle2, TrendingUp, Radio, CalendarDays, Activity } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminOverview() {
  const session = await requireRole([USER_ROLES.ADMIN]);
  const user = session?.user;

  const articlesDb = await getCollection(COLLECTIONS.ARTICLES);
  const users = [1,2,3,4,5,6,7,8,9,10,11,12]; // Mock active staff
  
  const articleStats = await articlesDb.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).toArray();
  const statsMap = articleStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
  
  const totalArticles = Object.values(statsMap).reduce((a, b) => a + b, 0);
  const pendingReview = (statsMap["SUBMITTED"] || 0) + (statsMap["RESUBMITTED"] || 0) + (statsMap["FACT_CHECK"] || 0);

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <p className="text-sm font-semibold text-slate-500 tracking-wider uppercase mb-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          <h1 className="text-3xl md:text-4xl dashboard-heading">
            Admin Overview
          </h1>
          <p className="dashboard-subheading mt-2">
            Global metrics and system performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/health"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Activity size={18} className="text-green-500" />
            System Health
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Articles" value={totalArticles} icon="FileText" color="blue" />
        <StatsCard label="Published Today" value={statsMap["PUBLISHED"] || 0} icon="CheckCircle2" color="green" />
        <StatsCard label="Pending Review" value={pendingReview} icon="Activity" color="orange" />
        <StatsCard label="Active Staff" value={users.length} icon="Users" color="indigo" />
        <StatsCard label="Total Views" value="2.4M" icon="TrendingUp" color="blue" />
        <StatsCard label="Active Readers" value="1,245" icon="Users" color="green" />
        <StatsCard label="Breaking Stories" value="1" icon="Radio" color="red" />
        <StatsCard label="Scheduled" value={statsMap["SCHEDULED"] || 0} icon="CalendarDays" color="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Traffic Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Traffic Overview</h2>
              <select className="text-sm font-medium border border-slate-300 rounded-lg px-3 py-1.5 outline-none">
                <option>Today</option>
                <option>7 Days</option>
                <option>30 Days</option>
                <option>90 Days</option>
              </select>
            </div>
            
            {/* Mock Chart Area */}
            <div className="h-64 w-full flex items-end justify-between gap-2 px-2 pb-6 border-b border-l border-slate-200 relative pt-10">
              <div className="absolute top-0 left-0 w-full flex justify-between text-xs text-slate-400">
                <span>100k</span>
                <div className="w-full h-px bg-slate-100 absolute top-2 left-8 z-0"></div>
              </div>
              <div className="absolute top-1/2 left-0 w-full flex justify-between text-xs text-slate-400 -translate-y-1/2">
                <span>50k</span>
                <div className="w-full h-px bg-slate-100 absolute top-2 left-8 z-0"></div>
              </div>
              
              {/* Bars */}
              {[40, 60, 45, 80, 55, 90, 70].map((height, i) => (
                <div key={i} className="w-full bg-indigo-100 rounded-t-sm relative z-10 hover:bg-indigo-200 transition-colors cursor-pointer group" style={{ height: `${height}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {height}k
                  </div>
                </div>
              ))}
              
              <div className="absolute -bottom-6 left-0 w-full flex justify-around text-xs text-slate-500 font-medium ml-4">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Admin Actions</h2>
            <div className="space-y-2">
              <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors border border-transparent hover:border-slate-200">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={18} /></div>
                <div className="font-medium text-sm">Manage Users</div>
              </Link>
              <Link href="/admin/articles" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors border border-transparent hover:border-slate-200">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={18} /></div>
                <div className="font-medium text-sm">Content Governance</div>
              </Link>
              <Link href="/admin/audit-logs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors border border-transparent hover:border-slate-200">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Activity size={18} /></div>
                <div className="font-medium text-sm">View Audit Logs</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
