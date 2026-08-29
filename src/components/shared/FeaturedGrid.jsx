import React from "react";
import Link from "next/link";
import Image from "next/image";
import { playfair } from "@/app/layout";

/**
 * FeaturedGrid
 * Displays 1 large main story (left, 2 cols) and up to 4 small stories (right, 1 col)
 */
export default function FeaturedGrid({ articles = [] }) {
  if (!articles || articles.length === 0) return null;

  const [main, ...secondary] = articles;
  const smallArticles = secondary.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6">
      {/* Main story — takes 2 columns */}
      <div className="lg:col-span-2">
        <Link
          href={`/news/${main._id}`}
          className="group block h-full flex flex-col"
          aria-label={main.title}
        >
          {/* Image */}
          <div className="relative w-full aspect-[16/9] lg:aspect-[4/3] overflow-hidden img-hover mb-4 rounded-xl">
            {main.cover_image?.url || main.image_url ? (
              <Image
                src={main.cover_image?.url || main.image_url}
                alt={main.cover_image?.alt || main.image_alt || main.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                priority
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <span className="text-white/30 text-6xl">📰</span>
              </div>
            )}
          </div>

          {/* Meta */}
          {main.categoryName && (
            <span className="category-badge text-xs mb-2 block">
              {main.categoryName}
            </span>
          )}

          {/* Headline */}
          <h2
            className={`${playfair.className} text-3xl md:text-4xl font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors mb-3`}
          >
            {main.title}
          </h2>

          {/* Excerpt */}
          {main.excerpt && (
            <p className="text-gray-600 text-base leading-relaxed line-clamp-3 mb-4">
              {main.excerpt}
            </p>
          )}

          {/* Byline */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
            <span className="font-semibold">{main.authorName || main.author?.name}</span>
            {(main.workflow?.publishedAt || main.author?.published_date) && (
              <>
                <span>·</span>
                <span>
                  {main.workflow?.publishedAt 
                    ? new Date(main.workflow.publishedAt).toLocaleDateString()
                    : main.author?.published_date}
                </span>
              </>
            )}
          </div>
        </Link>
      </div>

      {/* Secondary stories — right column */}
      {smallArticles.length > 0 && (
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-6 mt-6 lg:mt-0 flex flex-col justify-between space-y-6">
          {smallArticles.map((article, i) => (
            <div key={article._id} className="flex-1 flex flex-col justify-center">
              <Link
                href={`/news/${article._id}`}
                className="group flex flex-col"
                aria-label={article.title}
              >
                {article.categoryName && (
                  <span className="category-badge text-[10px] mb-2 block w-fit">
                    {article.categoryName}
                  </span>
                )}

                <h3 className="font-bold text-base md:text-lg text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                  {article.title}
                </h3>

                {article.excerpt && (
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <span className="font-medium text-gray-500">{article.authorName || article.author?.name}</span>
                </div>
              </Link>

              {i < smallArticles.length - 1 && (
                <div className="border-b border-gray-100 mt-6" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
