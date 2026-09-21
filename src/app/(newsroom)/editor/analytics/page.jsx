import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import StatsCard from "@/components/newsroom/StatsCard";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { BarChart3, TrendingUp, Users, Clock, AlertCircle, Calendar as CalendarIcon } from "lucide-react";

export default async function EditorAnalytics() {
  await requireRole([USER_ROLES.EDITOR, USER_ROLES.ADMIN]);
  
  const articlesDb = await getCollection(COLLECTIONS.ARTICLES);
  const usersDb = await getCollection(COLLECTIONS.USERS);
  
  // High-level analytics
  const allArticles = await articlesDb.find({}).toArray();
  const published = allArticles.filter(a => a.status === "PUBLISHED");
  const rejected = allArticles.filter(a => a.status === "REJECTED");
  const needingChanges = allArticles.filter(a => a.status === "NEEDS_CHANGES");
  
  const totalViews = published.reduce((acc, curr) => acc + (curr.stats?.views || 0), 0);
  
  const journalists = await usersDb.find({ role: "journalist" }).toArray();
  
  // Real Team Output calculation
  const teamOutput = journalists.map(journalist => {
    const journalistIdStr = journalist._id.toString();
    const journalistArticles = allArticles.filter(a => String(a.authorId) === journalistIdStr);
    const publishedArticles = journalistArticles.filter(a => a.status === "PUBLISHED");
    const views = publishedArticles.reduce((acc, curr) => acc + (curr.stats?.views || 0), 0);
    const revNeeded = journalistArticles.filter(a => a.status === "NEEDS_CHANGES").length;
    const revisionRate = journalistArticles.length > 0 
      ? Math.round((revNeeded / journalistArticles.length) * 100) 
      : 0;
      
    return {
      name: journalist.name || "Unknown",
      role: "Journalist",
      articles: publishedArticles.length,
      views: views,
      revisionRate: `${revisionRate}%`
    };
  }).sort((a, b) => b.articles - a.articles || b.views - a.views);

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-10 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Editor Analytics</h1>
          <p className="text-slate-500 mt-2">Team performance and editorial metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-blue-500">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Published" value={published.length} icon="Newspaper" color="green" />
        <StatsCard label="Total Network Views" value={totalViews.toLocaleString()} icon="TrendingUp" color="blue" />
        <StatsCard label="Revision Rate" value={`${allArticles.length > 0 ? Math.round((needingChanges.length / allArticles.length) * 100) : 0}%`} icon="AlertCircle" color="orange" />
        <StatsCard label="Avg. Review Time" value="2.4 hrs" icon="Clock" color="indigo" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Team Output
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Journalist</th>
                <th className="px-6 py-4">Articles Published</th>
                <th className="px-6 py-4">Total Views</th>
                <th className="px-6 py-4">Revision Rate</th>
                <th className="px-6 py-4">On-Time Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamOutput.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No active journalists found.
                  </td>
                </tr>
              )}
              {teamOutput.map((member, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{member.name}</div>
                    <div className="text-xs text-slate-500">{member.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">{member.articles}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">{member.views.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">{member.revisionRate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-slate-200 rounded-full h-2 max-w-[100px]">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.max(60, 100 - parseInt(member.revisionRate))}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
