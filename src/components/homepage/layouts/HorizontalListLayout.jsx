import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

/**
 * HorizontalListLayout
 * ┌────────────┬────────────────────────────────┐
 * │   Image    │  News Headline                 │
 * │            │  Short Description             │
 * │            │  Time / Category               │
 * ├────────────┼────────────────────────────────┤
 * │   Image    │  News Headline ...             │
 * └────────────┴────────────────────────────────┘
 */
const HorizontalListLayout = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  const items = articles.slice(0, 5);

  return (
    <div className="divide-y divide-gray-100">
      {items.map((article, i) => (
        <Link
          key={article._id}
          href={`/news/${article._id}`}
          className="group flex gap-4 py-4 first:pt-0 last:pb-0 hover:opacity-90 transition-opacity items-start"
          aria-label={article.title}
        >
          {/* Thumbnail */}
          <div className="relative w-28 h-20 md:w-36 md:h-24 flex-shrink-0 overflow-hidden rounded-lg img-hover">
            {article.image_url ? (
              <Image
                src={article.image_url}
                alt={article.image_alt || article.title}
                fill
                className="object-cover"
                sizes="144px"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
                <span className="text-gray-300 text-2xl">📰</span>
              </div>
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            {article.categoryName && (
              <span className="category-badge text-[10px] mb-1 block">{article.categoryName}</span>
            )}
            <h3 className="font-bold text-sm md:text-base text-gray-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed hidden sm:block">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <span className="font-medium text-gray-600">{article.author?.name}</span>
              {article.author?.published_date && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={9} />
                    {article.author.published_date}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Index number */}
          <span className="text-3xl font-black text-gray-100 hidden lg:block flex-shrink-0 leading-none mt-1">
            {String(i + 1).padStart(2, "0")}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default HorizontalListLayout;
