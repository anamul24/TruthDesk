import React from "react";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { DollarSign, Layout, Plus, Edit2, Play, Square, Settings as SettingsIcon } from "lucide-react";

export default async function MonetizationManager() {
  const adsDb = await getCollection(COLLECTIONS.AD_PLACEMENTS);
  const adSlots = await adsDb.find({}).toArray();

  const activeCount = adSlots.filter(s => s.status === "Active").length;
  const topPerformer = adSlots.sort((a, b) => (parseFloat(b.revenue || 0) - parseFloat(a.revenue || 0)))[0];

  const getStatusClass = (status) => {
    switch(status) {
      case "Active": return "bg-green-100 text-green-700";
      case "Inactive": return "bg-slate-100 text-slate-500";
      case "Scheduled": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
            <DollarSign className="text-green-600" size={32} />
            Monetization & Ads
          </h1>
          <p className="text-slate-500 mt-2">Manage ad placements, sponsorships, and revenue streams.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm">
          <Plus size={18} />
          New Ad Slot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 mb-1">Total Ad Slots</p>
          <h3 className="text-3xl font-black text-slate-900">{adSlots.length}</h3>
          <p className="text-xs text-slate-500 mt-2">{activeCount} currently active</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 mb-1">Active Placements</p>
          <h3 className="text-3xl font-black text-slate-900">{activeCount}</h3>
          <p className="text-xs text-slate-500 mt-2">Out of {adSlots.length} total slots</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 mb-1">Top Performing</p>
          {topPerformer ? (
            <>
              <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mt-1">{topPerformer.name}</h3>
              <p className="text-xs text-slate-500 mt-2">{topPerformer.type || "Ad Placement"}</p>
            </>
          ) : (
            <h3 className="text-lg font-bold text-slate-400 mt-1">No placements yet</h3>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-4 flex flex-col">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Placements</div>
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-900 bg-green-50 rounded-lg">
              All Placements
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              Homepage
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              Article Pages
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              Category Pages
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {adSlots.length > 0 ? adSlots.map(slot => (
              <div key={slot._id.toString()} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-green-300 transition-colors shadow-sm">
                
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                    <Layout size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{slot.name}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-1.5">
                      <span className="font-semibold text-slate-700">{slot.placement}</span>
                      <span>•</span>
                      <span>{slot.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-slate-500 font-medium">Revenue</div>
                    <div className="font-bold text-slate-900">{slot.revenue || "$0.00"}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusClass(slot.status)}`}>
                    {slot.status}
                  </span>
                  
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
                    {slot.status === 'Active' ? (
                      <button className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Pause">
                        <Square size={18} fill="currentColor" />
                      </button>
                    ) : (
                      <button className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Activate">
                        <Play size={18} fill="currentColor" />
                      </button>
                    )}
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Settings">
                      <SettingsIcon size={18} />
                    </button>
                  </div>
                </div>

              </div>
            )) : (
              <div className="p-12 text-center text-slate-500">
                <DollarSign size={32} className="mx-auto mb-3 text-slate-300" />
                <p>No ad placements found in the database.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
