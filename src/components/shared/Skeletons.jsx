import React from "react";

export function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white rounded-lg overflow-hidden border border-slate-100 animate-pulse">
      <div className="w-full aspect-[16/9] bg-slate-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
        <div className="h-6 bg-slate-200 rounded w-1/2"></div>
        <div className="pt-2 flex items-center gap-2">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonFeaturedGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6 animate-pulse">
      {/* Main story */}
      <div className="lg:col-span-2">
        <div className="w-full aspect-[16/9] lg:aspect-[4/3] bg-slate-200 rounded-xl mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
        <div className="h-10 bg-slate-200 rounded w-3/4 mb-3"></div>
        <div className="h-10 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/3 mt-6"></div>
      </div>

      {/* Secondary stories */}
      <div className="lg:col-span-1 flex flex-col justify-between space-y-6 lg:border-l lg:border-slate-100 lg:pl-6 mt-6 lg:mt-0 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-100">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 lg:block">
            <div className="w-1/3 lg:w-full aspect-[16/9] bg-slate-200 rounded-lg lg:mb-3 flex-shrink-0"></div>
            <div className="flex-1 space-y-2 lg:mt-0 mt-1">
              <div className="h-3 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-5 bg-slate-200 rounded w-full"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-48"></div>
        </div>
        <div className="h-10 bg-slate-200 rounded w-32"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-xl border border-slate-200"></div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between py-3 border-b border-slate-100">
              <div className="w-1/2 space-y-2">
                <div className="h-5 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
