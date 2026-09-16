import React from "react";
import { getSession, requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import StatsCard from "@/components/newsroom/StatsCard";
import { FileText, Eye, BarChart3, TrendingUp, ArrowRight, Clock, Calendar, CheckCircle2, AlertCircle, ClipboardCheck, Send } from "lucide-react";
import { getCollection, COLLECTIONS } from "@/lib/db";
import ArticleStatusBadge from "@/components/newsroom/ArticleStatusBadge";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export default async function JournalistDashboard() {
  const session = await requireRole([USER_ROLES.JOURNALIST, USER_ROLES.ADMIN]);
  const user = session?.user;
  const authorId = user?.id;

  const db = await getCollection(COLLECTIONS.ARTICLES);
  const assignmentsDb = await getCollection(COLLECTIONS.ASSIGNMENTS);

  // Stats
  const stats = await db.aggregate([
    { $match: { authorId } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).toArray();
  const statsMap = stats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});

  // Performance
  const publishedArticles = await db.find({ authorId, status: "PUBLISHED" }).project({ "stats.views": 1, title: 1 }).toArray();
  const totalViews = publishedArticles.reduce((sum, a) => sum + (a.stats?.views || 0), 0);
  const avgViews = publishedArticles.length > 0 ? Math.round(totalViews / publishedArticles.length) : 0;

  // Active Assignments (Mocking some for display if none exist, normally we just query)
  const activeAssignments = await assignmentsDb.find({ journalistId: authorId, status: { $in: ["ASSIGNED", "IN_PROGRESS"] } }).sort({ deadline: 1 }).limit(3).toArray();
  
  // Recent articles requiring attention
  const requiresAttention = await db.find({ authorId, status: { $in: ["NEEDS_CHANGES", "REVISION_REQUESTED"] } }).sort({ updatedAt: -1 }).limit(3).toArray();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <p className="text-sm font-semibold text-red-600 tracking-wider uppercase mb-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          <h1 className="text-3xl md:text-4xl dashboard-heading">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Journalist"}
          </h1>
          <p className="dashboard-subheading mt-2">
            Here is your newsroom overview for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/journalist/pitches/new"
            className="hidden md:inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Send size={18} />
            Pitch Idea
          </Link>
          <Link
            href="/journalist/write"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            <FileText size={18} />
            Write Story
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Today & Assignments */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Active Assignments
              </h2>
              <Link href="/journalist/assignments" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
            </div>
            
            <div className="space-y-4">
              {activeAssignments.length > 0 ? activeAssignments.map(assignment => (
                <div key={assignment._id.toString()} className="dashboard-card p-5 border-l-4 border-l-blue-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${assignment.priority === 'BREAKING' ? 'bg-red-100 text-red-700' : assignment.priority === 'URGENT' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                          {assignment.priority}
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Clock size={12} /> Due {formatDistanceToNow(new Date(assignment.deadline))}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight mt-1">{assignment.title}</h3>
                    </div>
                    <Link href={`/journalist/assignments/${assignment._id}`} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition">
                      Open
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="dashboard-card p-8 flex flex-col items-center justify-center text-center bg-slate-50/50">
                  <ClipboardCheck size={32} className="text-slate-300 mb-3" />
                  <h3 className="text-sm font-semibold text-slate-700">No Active Assignments</h3>
                  <p className="text-sm text-slate-500 mt-1">You're all caught up for today.</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-500" />
                Requires Attention
              </h2>
            </div>
            <div className="dashboard-card overflow-hidden">
              <div className="divide-y divide-slate-100">
                {requiresAttention.length > 0 ? requiresAttention.map(article => (
                  <div key={article._id.toString()} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <Link href={`/journalist/articles/${article._id}`} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1">
                        <ArticleStatusBadge status={article.status} />
                        <span className="text-xs text-slate-500">Updated {formatDistanceToNow(new Date(article.updatedAt))} ago</span>
                      </div>
                    </div>
                    <Link href={`/journalist/write?id=${article._id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      Edit
                    </Link>
                  </div>
                )) : (
                  <div className="p-6 text-center text-sm text-slate-500">No revisions requested.</div>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">My Work</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard label="Drafts" value={statsMap["DRAFT"] || 0} icon="FileText" color="gray" />
              <StatsCard label="In Review" value={(statsMap["SUBMITTED"] || 0) + (statsMap["IN_REVIEW"] || 0) + (statsMap["FACT_CHECK"] || 0)} icon="ClipboardCheck" color="indigo" />
              <StatsCard label="Revisions" value={statsMap["NEEDS_CHANGES"] || 0} icon="AlertCircle" color="orange" />
              <StatsCard label="Published" value={statsMap["PUBLISHED"] || 0} icon="CheckCircle2" color="green" />
            </div>
          </section>
          
        </div>

        {/* Right Column: Performance & Deadlines */}
        <div className="space-y-8">
          
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-600" />
              Performance (30 Days)
            </h2>
            <div className="dashboard-card p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Total Views</p>
                  <p className="text-3xl font-black mt-1">{totalViews.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Published</p>
                    <p className="text-xl font-bold mt-1">{statsMap["PUBLISHED"] || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Avg. Views</p>
                    <p className="text-xl font-bold mt-1">{avgViews.toLocaleString()}</p>
                  </div>
                </div>
                <Link href="/journalist/performance" className="flex items-center justify-between w-full py-2 px-3 mt-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">
                  View Full Analytics <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming Deadlines</h2>
            <div className="dashboard-card p-5">
              <div className="relative border-l-2 border-slate-200 ml-3 py-2 space-y-6">
                {activeAssignments.map((assignment, index) => (
                  <div key={assignment._id.toString()} className="relative pl-6">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{format(new Date(assignment.deadline), "h:mm a")}</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{assignment.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{assignment.priority} Priority</p>
                  </div>
                ))}
                {activeAssignments.length === 0 && (
                  <p className="text-sm text-slate-500 pl-6">No deadlines approaching.</p>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
