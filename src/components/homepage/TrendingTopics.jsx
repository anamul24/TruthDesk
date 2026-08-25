import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

/**
 * TrendingTopics — hashtag chips from article tags.
 */
const TrendingTopics = ({ topics }) => {
  if (!topics || topics.length === 0) return null;

  return (
    <section className="bg-gray-50 border-y border-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <TrendingUp size={16} className="text-red-600" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-800">
            Trending Topics
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Topic chips */}
        <div className="flex flex-wrap gap-2.5">
          {topics.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
            >
              <span className="text-red-500 font-bold text-xs">#</span>
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingTopics;
