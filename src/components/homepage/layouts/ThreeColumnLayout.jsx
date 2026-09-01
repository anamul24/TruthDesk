import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

/**
 * ThreeColumnLayout
 * ┌──────────────┬──────────────┬──────────────┐
 * │    News 1    │    News 2    │    News 3    │
 * ├──────────────┼──────────────┼──────────────┤
 * │    News 4    │    News 5    │    News 6    │
 * └──────────────┴──────────────┴──────────────┘
 */
const ThreeColumnLayout = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  const items = articles.slice(0, 6);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((article, i) => (
        <Link
          key={article._id}
          href={`/news/${article._id}`}
          className="group block card-hover"
          aria-label={article.title}
        >
          {/* Image */}
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg img-hover mb-3">
            {article.image_url ? (
              <Image
                src={article.image_url}
                alt={article.image_alt || article.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-300 text-4xl">📰</span>
              </div>
            )}
            {article.categoryName && (
              <div className="absolute top-2 left-2">
                <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                  {article.categoryName}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <h3 className="font-bold text-sm text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
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

          {/* Divider between rows on mobile */}
          {i < items.length - 1 && i % 3 === 2 && (
            <div className="hidden lg:block" />
          )}
        </Link>
      ))}
    </div>
  );
};

export default ThreeColumnLayout;
