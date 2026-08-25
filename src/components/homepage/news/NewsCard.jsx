import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

/**
 * StandardNewsCard — used in category sections (1 big + 2 small grid)
 * variant: "large" | "small" (default: "small")
 */
const NewsCard = ({ news, variant = "small" }) => {
  const isLarge = variant === "large";

  const timeAgo = news.author?.published_date || "Recently";

  return (
    <Link
      href={`/news/${news._id}`}
      className="group block bg-white overflow-hidden card-hover"
      aria-label={news.title}
    >
      {/* Image */}
      <div
        className={`relative w-full overflow-hidden img-hover ${
          isLarge ? "aspect-[16/9]" : "aspect-[16/9]"
        }`}
      >
        {news.image_url ? (
          <Image
            src={news.image_url}
            alt={news.image_alt || news.title}
            fill
            className="object-cover"
            sizes={isLarge ? "(max-width: 768px) 100vw, 600px" : "(max-width: 768px) 100vw, 300px"}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-300 text-4xl">📰</span>
          </div>
        )}

        {/* Category overlay badge */}
        {news.categoryName && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
              {news.categoryName}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`pt-3 ${isLarge ? "pb-2" : "pb-1"}`}>
        <h3
          className={`font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors ${
            isLarge ? "text-lg md:text-xl" : "text-sm"
          }`}
        >
          {news.title}
        </h3>

        {isLarge && news.excerpt && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {news.excerpt}
          </p>
        )}

        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          <span className="font-medium text-gray-600">{news.author?.name}</span>
          {timeAgo && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {timeAgo}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
