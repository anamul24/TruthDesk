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
  const usersDb = await getCollection(COLLECTIONS.USERS);
  const breakingDb = await getCollection(COLLECTIONS.BREAKING_NEWS);

  const activeStaffCount = await usersDb.countDocuments({ status: { $ne: "Inactive" } });
  const articleStats = await articlesDb.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).toArray();
  const statsMap = articleStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
  
  const totalArticles = Object.values(statsMap).reduce((a, b) => a + b, 0);
  const pendingReview = (statsMap["SUBMITTED"] || 0) + (statsMap["RESUBMITTED"] || 0) + (statsMap["FACT_CHECK"] || 0);
  const breakingCount = await breakingDb.countDocuments({ isActive: true });

  // Today's published: articles published today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const publishedToday = await articlesDb.countDocuments({
    status: "PUBLISHED",
    "workflow.publishedAt": { $gte: todayStart }
  });

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
        <StatsCard label="Published Today" value={publishedToday} icon="CheckCircle2" color="green" />
        <StatsCard label="Pending Review" value={pendingReview} icon="Activity" color="orange" />
        <StatsCard label="Active Staff" value={activeStaffCount} icon="Users" color="indigo" />
        <StatsCard label="Total Published" value={statsMap["PUBLISHED"] || 0} icon="TrendingUp" color="blue" />
        <StatsCard label="Total Drafts" value={statsMap["DRAFT"] || 0} icon="FileText" color="green" />
        <StatsCard label="Active Breaking" value={breakingCount} icon="Radio" color="red" />
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
            <div className="h-64 w-full flex items-center justify-center border border-slate-200 border-dashed rounded-xl mt-6 bg-slate-50">
              <div className="text-center text-slate-500">
                <TrendingUp size={32} className="mx-auto mb-3 text-slate-300" />
                <p>Analytics aggregation service not configured.</p>
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
              <Link href="/admin/invitations" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors border border-transparent hover:border-slate-200">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Radio size={18} /></div>
                <div className="font-medium text-sm">Manage Invitations</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
