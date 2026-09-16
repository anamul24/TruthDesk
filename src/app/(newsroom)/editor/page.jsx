import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import StatsCard from "@/components/newsroom/StatsCard";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { ClipboardCheck, AlertCircle, FileText, CheckCircle2, TrendingUp, Clock, CalendarDays, Newspaper, Users, Radio, Layout, CheckSquare } from "lucide-react";
import Link from "next/link";
import ArticleStatusBadge from "@/components/newsroom/ArticleStatusBadge";
import { formatDistanceToNow, format } from "date-fns";

export default async function EditorDashboard() {
  const session = await requireRole([USER_ROLES.EDITOR, USER_ROLES.ADMIN]);
  const user = session?.user;

  const articlesDb = await getCollection(COLLECTIONS.ARTICLES);
  const assignmentsDb = await getCollection(COLLECTIONS.ASSIGNMENTS);
  const breakingDb = await getCollection(COLLECTIONS.BREAKING_NEWS);

  // Stats
  const articleStats = await articlesDb.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).toArray();
  const statsMap = articleStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});

  // Editorial Queue (Pending Review, Fact Check, Resubmitted)
  const editorialQueue = await articlesDb.find({ 
    status: { $in: ["SUBMITTED", "IN_REVIEW", "FACT_CHECK", "RESUBMITTED"] } 
  }).sort({ updatedAt: -1 }).limit(5).toArray();

  // Breaking News
  const activeBreaking = await breakingDb.find({ isActive: true }).toArray();

  // Upcoming Deadlines (Assignments)
  const upcomingDeadlines = await assignmentsDb.find({
    status: { $in: ["ASSIGNED", "IN_PROGRESS"] },
    deadline: { $gt: new Date() }
  }).sort({ deadline: 1 }).limit(4).toArray();

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
          <p className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          <h1 className="text-3xl md:text-4xl dashboard-heading">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Editor"}
          </h1>
          <p className="dashboard-subheading mt-2">
            Here is your editorial command center.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/editor/review"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ClipboardCheck size={18} />
            Review Queue
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard label="Pending Review" value={(statsMap["SUBMITTED"] || 0) + (statsMap["RESUBMITTED"] || 0)} icon="ClipboardCheck" color="indigo" />
        <StatsCard label="Needs Changes" value={statsMap["NEEDS_CHANGES"] || 0} icon="AlertCircle" color="orange" />
        <StatsCard label="Fact Check" value={statsMap["FACT_CHECK"] || 0} icon="FileText" color="yellow" />
        <StatsCard label="Scheduled" value={statsMap["SCHEDULED"] || 0} icon="CalendarDays" color="blue" />
        <StatsCard label="Published Today" value={statsMap["PUBLISHED"] || 0} icon="Newspaper" color="green" />
        <StatsCard label="Team Members" value="12" icon="Users" color="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Review Queue & Breaking */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck size={18} className="text-indigo-600" />
                Editorial Queue
              </h2>
              <Link href="/editor/review" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {editorialQueue.length > 0 ? editorialQueue.map(article => (
                  <div key={article._id.toString()} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ArticleStatusBadge status={article.status} />
                        <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded-sm bg-slate-100">
                          {article.categoryId || "Category"}
                        </span>
                      </div>
                      <Link href={`/editor/review/${article._id}`} className="font-bold text-slate-900 text-lg hover:text-blue-600 transition-colors line-clamp-1">
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {article.authorName || "Unknown Author"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> Submitted {formatDistanceToNow(new Date(article.updatedAt))} ago
                        </span>
                      </div>
                    </div>
                    <Link href={`/editor/review/${article._id}`} className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-100 transition whitespace-nowrap text-center">
                      Review
                    </Link>
                  </div>
                )) : (
                  <div className="p-10 text-center flex flex-col items-center">
                    <CheckCircle2 size={32} className="text-green-500 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700">Queue is empty</h3>
                    <p className="text-sm text-slate-500 mt-1">All articles have been reviewed.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {activeBreaking.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                <Radio size={18} className="animate-pulse" />
                Active Breaking News
              </h2>
              <div className="space-y-3">
                {activeBreaking.map(alert => (
                  <div key={alert._id.toString()} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1 block">Live Alert</span>
                      <p className="font-bold text-slate-900">{alert.headline}</p>
                    </div>
                    <Link href="/editor/breaking-news" className="text-sm font-medium text-red-700 hover:text-red-800 bg-red-100 px-3 py-1.5 rounded-lg">Manage</Link>
                  </div>
                ))}
              </div>
            </section>
          )}
          
        </div>

        {/* Right Column: Deadlines & Team Activity */}
        <div className="space-y-8">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Upcoming Deadlines</h2>
              <Link href="/editor/assignments" className="text-sm font-medium text-blue-600 hover:text-blue-700">Assignments</Link>
            </div>
            <div className="dashboard-card p-5">
              <div className="relative border-l-2 border-slate-200 ml-3 py-2 space-y-6">
                {upcomingDeadlines.map((assignment) => (
                  <div key={assignment._id.toString()} className="relative pl-6">
                    <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white ${assignment.priority === 'BREAKING' ? 'bg-red-500' : assignment.priority === 'URGENT' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{format(new Date(assignment.deadline), "MMM d, h:mm a")}</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1 line-clamp-1">{assignment.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Assigned to ID: {assignment.journalistId.substring(0,6)}</p>
                  </div>
                ))}
                {upcomingDeadlines.length === 0 && (
                  <p className="text-sm text-slate-500 pl-6">No immediate deadlines.</p>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/editor/assignments/new" className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                  <CheckSquare size={20} />
                </div>
                <span className="text-xs font-semibold text-slate-700">Assign Story</span>
              </Link>
              <Link href="/editor/breaking-news" className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-2 group-hover:scale-110 transition-transform">
                  <Radio size={20} />
                </div>
                <span className="text-xs font-semibold text-slate-700">Breaking Alert</span>
              </Link>
              <Link href="/editor/homepage" className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                  <Layout size={20} />
                </div>
                <span className="text-xs font-semibold text-slate-700">Curate Home</span>
              </Link>
              <Link href="/editor/analytics" className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-2 group-hover:scale-110 transition-transform">
                  <TrendingUp size={20} />
                </div>
                <span className="text-xs font-semibold text-slate-700">Analytics</span>
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
