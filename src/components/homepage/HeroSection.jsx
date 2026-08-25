import React from "react";
import Link from "next/link";
import Image from "next/image";
import { playfair } from "@/app/layout";

/**
 * HeroSection — Top Stories
 * Main story (large) + 2 secondary stories (right column)
 */
const HeroSection = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  const [main, ...secondary] = articles;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-5">
        <span className="section-title">Top Stories</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6">
        {/* Main story — takes 2 columns */}
        <div className="lg:col-span-2">
          <Link
            href={`/news/${main._id}`}
            className="group block"
            aria-label={main.title}
          >
            {/* Image */}
            <div className="relative w-full aspect-[16/9] overflow-hidden img-hover mb-4">
              {main.image_url ? (
                <Image
                  src={main.image_url}
                  alt={main.image_alt || main.title}
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
              className={`${playfair.className} text-2xl md:text-3xl font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors mb-3`}
            >
              {main.title}
            </h2>

            {/* Excerpt */}
            {main.excerpt && (
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-3">
                {main.excerpt}
              </p>
            )}

            {/* Byline */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-semibold text-gray-600">{main.author?.name}</span>
              {main.author?.published_date && (
                <>
                  <span>·</span>
                  <span>{main.author.published_date}</span>
                </>
              )}
            </div>
          </Link>
        </div>

        {/* Secondary stories — right column */}
        {secondary.length > 0 && (
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-6 mt-6 lg:mt-0 space-y-6">
            {secondary.slice(0, 2).map((article, i) => (
              <div key={article._id}>
                <Link
                  href={`/news/${article._id}`}
                  className="group block"
                  aria-label={article.title}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-[16/9] overflow-hidden img-hover mb-3">
                    {article.image_url ? (
                      <Image
                        src={article.image_url}
                        alt={article.image_alt || article.title}
                        fill
                        className="object-cover"
                        sizes="300px"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-300 text-3xl">📰</span>
                      </div>
                    )}
                  </div>

                  {article.categoryName && (
                    <span className="category-badge text-[10px] mb-1 block">
                      {article.categoryName}
                    </span>
                  )}

                  <h3 className="font-bold text-sm md:text-base text-gray-900 leading-snug group-hover:text-red-600 transition-colors">
                    {article.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                    <span className="font-medium text-gray-500">{article.author?.name}</span>
                    {article.author?.published_date && (
                      <>
                        <span>·</span>
                        <span>{article.author.published_date}</span>
                      </>
                    )}
                  </div>
                </Link>

                {i < secondary.slice(0, 2).length - 1 && (
                  <div className="border-b border-gray-100 mt-6" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
