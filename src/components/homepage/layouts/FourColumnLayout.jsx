import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

/**
 * FourColumnLayout
 * ┌───────────┬───────────┬───────────┬───────────┐
 * │  News 1   │  News 2   │  News 3   │  News 4   │
 * ├───────────┼───────────┼───────────┼───────────┤
 * │  News 5   │  News 6   │  News 7   │  News 8   │
 * └───────────┴───────────┴───────────┴───────────┘
 */
const FourColumnLayout = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  const items = articles.slice(0, 8);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
      {items.map((article, i) => (
        <Link
          key={article._id}
          href={`/news/${article._id}`}
          className="group block card-hover"
          aria-label={article.title}
        >
          {/* Image */}
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg img-hover mb-2.5">
            {article.image_url ? (
              <Image
                src={article.image_url}
                alt={article.image_alt || article.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <span className="text-slate-300 text-3xl">📰</span>
              </div>
            )}
            {/* Row divider — subtle top border for second row */}
            {i === 4 && <div className="absolute -top-2.5 left-0 right-0 h-px bg-gray-100" />}
          </div>

          {/* Category */}
          {article.categoryName && (
            <span className="category-badge text-[9px] mb-1 block">{article.categoryName}</span>
          )}

          {/* Title */}
          <h3 className="font-bold text-xs md:text-sm text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
            {article.title}
          </h3>

          {/* Time */}
          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-0.5">
            <Clock size={8} />
            {article.author?.published_date}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default FourColumnLayout;
