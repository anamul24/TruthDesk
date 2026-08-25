import React from "react";
import Link from "next/link";
import NewsCard from "@/components/homepage/news/NewsCard";

/**
 * CategorySection — reusable section for a single category.
 * Layout: 1 large card (left) + 2 smaller cards (right) on desktop.
 */
const CategorySection = ({ categoryName, categoryId, articles }) => {
  if (!articles || articles.length === 0) return null;

  const [bigStory, ...smallStories] = articles;

  return (
    <section className="container mx-auto px-4 py-8 border-t border-gray-100">
      {/* Section header */}
      <div className="mb-5 flex items-center gap-4">
        <Link
          href={`/category/${categoryId}`}
          className="text-xs font-black uppercase tracking-widest text-gray-800 hover:text-red-600 transition-colors"
        >
          {categoryName}
        </Link>
        <div className="flex-1 h-px bg-gray-100" />
        <Link
          href={`/category/${categoryId}`}
          className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors shrink-0"
        >
          See all →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Big story — takes 2 columns on md+ */}
        <div className="md:col-span-2">
          <NewsCard news={bigStory} variant="large" />
        </div>

        {/* Smaller stories — right column */}
        <div className="md:col-span-1 space-y-5 border-t md:border-t-0 md:border-l border-gray-100 pt-5 md:pt-0 md:pl-5">
          {smallStories.slice(0, 2).map((article, i) => (
            <div key={article._id}>
              <NewsCard news={article} variant="small" />
              {i < 1 && smallStories.length > 1 && (
                <div className="border-b border-gray-100 mt-5" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
