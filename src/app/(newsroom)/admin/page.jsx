import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS, getDb } from "@/lib/db";
import StatsCard from "@/components/newsroom/StatsCard";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import ArticleStatusBadge from "@/components/newsroom/ArticleStatusBadge";
import {
  Users,
  FileText,
  ClipboardCheck,
  Newspaper,
  BarChart3,
  Archive,
  Settings,
  MailCheck,
  Eye,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboard() {
  const session = await requireRole([USER_ROLES.ADMIN]);
  const user = session?.user;

  const articlesCol = await getCollection(COLLECTIONS.ARTICLES);
  const articleStats = await articlesCol
    .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();

  const statsMap = articleStats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const totalArticles = Object.values(statsMap).reduce((a, b) => a + b, 0);

  // Users
  const db = await getDb();
  const totalUsers = await db.collection("user").countDocuments();
  const journalistCount = await db.collection("user").countDocuments({ role: "journalist" });
  const editorCount = await db.collection("user").countDocuments({ role: "editor" });

  // Global view stats
  const viewStats = await articlesCol
    .aggregate([
      { $match: { status: "PUBLISHED" } },
      { $group: { _id: null, totalViews: { $sum: "$stats.views" } } },
    ])
    .toArray();
  const totalViews = viewStats[0]?.totalViews || 0;

  // Recent articles
  const recentArticles = await articlesCol
    .find({})
    .sort({ updatedAt: -1 })
    .limit(6)
    .toArray();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const pendingCount = (statsMap["SUBMITTED"] || 0) + (statsMap["RESUBMITTED"] || 0);

  const quickLinks = [
    { label: "User Management", href: "/admin/users", desc: "Manage roles & access", icon: Users, color: "from-indigo-500 to-indigo-600" },
    { label: "All Articles", href: "/admin/articles", desc: "Articles & statuses", icon: FileText, color: "from-slate-700 to-slate-800" },
    { label: "Categories", href: "/admin/categories", desc: "Manage news categories", icon: Archive, color: "from-emerald-500 to-emerald-600" },
    { label: "Analytics", href: "/admin/analytics", desc: "Views & performance", icon: BarChart3, color: "from-blue-500 to-blue-600" },
    { label: "Invitations", href: "/admin/invitations", desc: "Invite journalists/editors", icon: MailCheck, color: "from-violet-500 to-violet-600" },
    { label: "My Profile", href: "/admin/profile", desc: "Edit your profile", icon: Settings, color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-slate-500 mt-1">Full system overview — TruthDesk CMS</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Users size={16} />
            Manage Users
          </Link>
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-medium text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            <BarChart3 size={16} />
            Analytics
          </Link>
        </div>
      </div>

      {/* Users Section */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Users</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard label="Total Users" value={totalUsers} icon="Users" color="indigo" />
          <StatsCard label="Journalists" value={journalistCount} icon="FileText" color="gray" />
          <StatsCard label="Editors" value={editorCount} icon="ClipboardCheck" color="purple" />
        </div>
      </div>

      {/* Articles + Views */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Content & Views</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatsCard label="Total Articles" value={totalArticles} icon="Newspaper" color="gray" />
          <StatsCard label="Pending Review" value={pendingCount} icon="AlertCircle" color="orange" />
          <StatsCard label="Published" value={statsMap["PUBLISHED"] || 0} icon="CheckCircle2" color="green" />
          <StatsCard label="In Review" value={statsMap["IN_REVIEW"] || 0} icon="TrendingUp" color="indigo" />
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white flex flex-col">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <Eye size={16} className="text-white" />
            </div>
            <p className="text-2xl font-black">{totalViews.toLocaleString()}</p>
            <p className="text-xs font-semibold text-blue-100 mt-1 uppercase tracking-wide">Total Views</p>
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent Articles</h2>
          <Link href="/admin/articles" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentArticles.length > 0 ? (
            recentArticles.map((article) => (
              <div
                key={article._id.toString()}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{article.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>by {article.authorName || "Unknown"}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{article.updatedAt ? formatDistanceToNow(new Date(article.updatedAt)) + " ago" : "Recently"}</span>
                    {(article.stats?.views || 0) > 0 && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="flex items-center gap-0.5">
                          <Eye size={10} />{article.stats.views} views
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ArticleStatusBadge status={article.status} />
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">No articles yet.</div>
          )}
        </div>
      </div>

      {/* Quick Links Grid */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md hover:border-slate-300 transition-all text-center"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2`}>
                <item.icon size={16} className="text-white" />
              </div>
              <p className="font-semibold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">{item.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
