import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { Archive, Plus, Search, GripVertical, Edit2, Tag } from "lucide-react";

export default async function CategoryManagement() {
  await requireRole([USER_ROLES.ADMIN]);

  const categoriesDb = await getCollection(COLLECTIONS.CATEGORIES);
  const articlesDb = await getCollection(COLLECTIONS.ARTICLES);

  const categories = await categoriesDb.find({}).sort({ name: 1 }).toArray();

  // Get article count per category
  const articleCounts = await articlesDb.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } }
  ]).toArray();

  const countMap = articleCounts.reduce((acc, curr) => ({ ...acc, [curr._id?.toString()]: curr.count }), {});

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
            <Archive className="text-indigo-600" size={32} />
            Categories
          </h1>
          <p className="text-slate-500 mt-2">Manage taxonomy and content organization.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={18} />
          New Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Sidebar / Filters */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-4 flex flex-col">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Filters</div>
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-900 bg-indigo-50 rounded-lg">
              All Categories <span className="bg-white text-indigo-600 px-2 py-0.5 rounded-full text-xs">{categories.length}</span>
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              Active
              <span className="text-slate-400 text-xs">{categories.filter(c => c.status !== "Inactive").length}</span>
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              Inactive
              <span className="text-slate-400 text-xs">{categories.filter(c => c.status === "Inactive").length}</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 p-4 overflow-y-auto">
          {categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat._id.toString()} className="bg-white border border-slate-200 p-3 rounded-lg flex items-center gap-4 hover:border-indigo-300 transition-colors group shadow-sm">
                  <button className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                    <GripVertical size={20} />
                  </button>
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">
                    <Tag size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{cat.name}</h3>
                    <div className="text-xs text-slate-500 flex gap-3 mt-0.5">
                      <span>/{cat.slug || cat.name?.toLowerCase().replace(/\s+/g, "-")}</span>
                      <span>•</span>
                      <span>{countMap[cat._id?.toString()] || 0} articles</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      cat.status === "Inactive" ? "bg-slate-100 text-slate-500" : "bg-green-100 text-green-700"
                    }`}>
                      {cat.status || "Active"}
                    </span>
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <Archive size={28} className="text-indigo-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Categories Yet</h3>
              <p className="text-slate-500 mt-1 text-sm">Create your first category to organize content.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
