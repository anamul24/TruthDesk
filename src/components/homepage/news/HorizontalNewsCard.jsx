import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

/**
 * HorizontalNewsCard — image left, text right.
 * Used in Latest News section.
 */
const HorizontalNewsCard = ({ news, showExcerpt = true }) => {
  return (
    <Link
      href={`/news/${news._id}`}
      className="group flex gap-4 items-start py-4 border-b border-gray-100 last:border-0 hover:opacity-90 transition-opacity"
      aria-label={news.title}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-16 sm:w-28 sm:h-20 flex-shrink-0 overflow-hidden rounded-sm img-hover">
        {news.image_url ? (
          <Image
            src={news.image_url}
            alt={news.image_alt || news.title}
            fill
            className="object-cover"
            sizes="112px"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-300 text-lg">📰</span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        {news.categoryName && (
          <span className="category-badge text-[10px] mb-1 block">
            {news.categoryName}
          </span>
        )}
        <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
          {news.title}
        </h3>
        {showExcerpt && news.excerpt && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1 leading-relaxed hidden sm:block">
            {news.excerpt}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
          <span className="font-medium text-gray-500">{news.author?.name}</span>
          {news.author?.published_date && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Clock size={9} />
                {news.author.published_date}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HorizontalNewsCard;
