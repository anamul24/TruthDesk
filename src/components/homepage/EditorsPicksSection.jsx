import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

/**
 * EditorsPicksSection — 3-card grid of editor-selected articles.
 */
const EditorsPicksSection = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      {/* Section header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          <span
            className="text-xs font-black uppercase tracking-widest text-gray-800"
          >
            Editor&apos;s Picks
          </span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.slice(0, 3).map((article) => (
          <Link
            key={article._id}
            href={`/news/${article._id}`}
            className="group block overflow-hidden card-hover"
            aria-label={article.title}
          >
            {/* Image */}
            <div className="relative w-full aspect-[16/9] overflow-hidden img-hover mb-3">
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
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-300 text-3xl">📰</span>
                </div>
              )}

              {/* Editor's Pick badge */}
              <div className="absolute top-3 right-3">
                <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 flex items-center gap-1">
                  <Star size={8} className="fill-white" />
                  Pick
                </span>
              </div>
            </div>

            {/* Category */}
            {article.categoryName && (
              <span className="category-badge text-[10px] mb-1 block">
                {article.categoryName}
              </span>
            )}

            {/* Headline */}
            <h3 className="font-bold text-sm md:text-base text-gray-900 leading-snug group-hover:text-red-600 transition-colors">
              {article.title}
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {/* Byline */}
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <span className="font-medium text-gray-600">{article.author?.name}</span>
              {article.author?.published_date && (
                <>
                  <span>·</span>
                  <span>{article.author.published_date}</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default EditorsPicksSection;
