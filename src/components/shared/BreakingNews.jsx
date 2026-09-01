import React from "react";
import Link from "next/link";
import { getBreakingNews } from "@/lib/data";

const BreakingNews = async () => {
  const items = await getBreakingNews(8);

  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white border-y border-gray-200">
      <div className="container mx-auto px-4 flex items-stretch">
        {/* Label */}
        <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 font-bold uppercase tracking-wider text-xs shrink-0">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="hidden sm:inline">Breaking</span>
          <span className="sm:hidden">Live</span>
        </div>

        <div className="w-px bg-gray-200 mx-0" />

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden flex items-center">
          <div className="flex animate-[ticker_30s_linear_infinite] whitespace-nowrap hover:[animation-play-state:paused]">
            {[...items, ...items].map((item, i) => {
              const href = item.url || (item._id && !item.url ? null : null);
              const content = (
                <span className="text-xs font-medium text-gray-700 hover:text-red-600 transition-colors mx-8 shrink-0 inline-flex items-center gap-2">
                  {i > 0 && <span className="text-gray-300 mr-6">•</span>}
                  {item.title}
                </span>
              );

              return href ? (
                <Link key={`${item._id}-${i}`} href={href} className="inline-flex">
                  {content}
                </Link>
              ) : (
                <span key={`${item._id}-${i}`}>{content}</span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNews;
