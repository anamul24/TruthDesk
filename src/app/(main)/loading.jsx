import React from "react";
import { SkeletonFeaturedGrid, SkeletonCard } from "@/components/shared/Skeletons";

export default function LoadingMain() {
  return (
    <main className="container mx-auto px-4 py-8 space-y-12 animate-pulse">
      {/* Hero section skeleton */}
      <section>
        <div className="mb-5">
          <div className="h-6 bg-slate-200 rounded w-32"></div>
        </div>
        <SkeletonFeaturedGrid />
      </section>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Other sections skeleton */}
      <section>
        <div className="flex justify-between items-end border-b-2 border-slate-100 pb-2 mb-6">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
