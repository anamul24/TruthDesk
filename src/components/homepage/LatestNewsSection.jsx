import React from "react";
import Link from "next/link";
import HorizontalNewsCard from "@/components/homepage/news/HorizontalNewsCard";

/**
 * LatestNewsSection — Latest News (left) + Most Read (right)
 */
const LatestNewsSection = ({ latestArticles, mostReadArticles }) => {
  return (
    <section className="bg-gray-50 border-y border-gray-100">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Latest News — takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-5">
              <span className="section-title-dark">Latest News</span>
            </div>

            {latestArticles && latestArticles.length > 0 ? (
              <div>
                {latestArticles.map((article) => (
                  <HorizontalNewsCard key={article._id} news={article} showExcerpt />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-8">No articles yet.</p>
            )}
          </div>

          {/* Most Read — right column */}
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-200 pt-8 lg:pt-0 lg:pl-8">
            <div className="mb-5">
              <span className="section-title-dark">Most Read</span>
            </div>

            {mostReadArticles && mostReadArticles.length > 0 ? (
              <ol className="space-y-4">
                {mostReadArticles.map((article, i) => (
                  <li key={article._id}>
                    <Link
                      href={`/news/${article._id}`}
                      className="group flex gap-4 items-start"
                      aria-label={article.title}
                    >
                      {/* Number */}
                      <span
                        className={`text-4xl font-black leading-none shrink-0 w-8 text-right ${
                          i === 0 ? "text-red-200" : "text-gray-100"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <div className="flex-1 min-w-0">
                        {article.categoryName && (
                          <span className="category-badge text-[10px] mb-1 block">
                            {article.categoryName}
                          </span>
                        )}
                        <h4 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {article.author?.published_date}
                        </p>
                      </div>
                    </Link>

                    {i < mostReadArticles.length - 1 && (
                      <div className="border-b border-gray-100 mt-4" />
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-400 text-sm">No data available.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestNewsSection;
