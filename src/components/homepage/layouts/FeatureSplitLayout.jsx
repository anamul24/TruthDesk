import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { playfair } from "@/app/layout";

/**
 * FeatureSplitLayout
 * Layout:
 * ┌─────────────────────┬──────────────┐
 * │                     │  News 2      │
 * │   Main Story        ├──────────────┤
 * │                     │  News 3      │
 * ├───────────┬──────────┴──────────────┤
 * │  News 4   │  News 5   │   News 6   │
 * └───────────┴───────────┴────────────┘
 */
const FeatureSplitLayout = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  const [main, second, third, ...bottom] = articles;
  const bottomRow = bottom.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top section: main (left 2/3) + 2 stacked (right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main big story */}
        {main && (
          <div className="lg:col-span-2">
            <Link href={`/news/${main._id}`} className="group block" aria-label={main.title}>
              <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl img-hover mb-4">
                {main.image_url ? (
                  <Image src={main.image_url} alt={main.image_alt || main.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 700px" unoptimized />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <span className="text-white/20 text-5xl">📰</span>
                  </div>
                )}
                {main.categoryName && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">{main.categoryName}</span>
                  </div>
                )}
              </div>
              <h2 className={`${playfair.className} text-2xl md:text-3xl font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors mb-2`}>
                {main.title}
              </h2>
              {main.excerpt && <p className="text-gray-500 text-sm line-clamp-2">{main.excerpt}</p>}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <span className="font-medium text-gray-600">{main.author?.name}</span>
                {main.author?.published_date && <><span>·</span><span className="flex items-center gap-1"><Clock size={10} />{main.author.published_date}</span></>}
              </div>
            </Link>
          </div>
        )}

        {/* Right: 2 stacked articles */}
        <div className="lg:col-span-1 flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-5">
          {[second, third].filter(Boolean).map((article, i) => (
            <div key={article._id}>
              <Link href={`/news/${article._id}`} className="group block" aria-label={article.title}>
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg img-hover mb-3">
                  {article.image_url ? (
                    <Image src={article.image_url} alt={article.image_alt || article.title} fill className="object-cover" sizes="300px" unoptimized />
                  ) : (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center"><span className="text-gray-300 text-3xl">📰</span></div>
                  )}
                  {article.categoryName && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5">{article.categoryName}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-sm text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={9} />{article.author?.published_date}</p>
              </Link>
              {i === 0 && third && <div className="border-b border-gray-100 mt-5" />}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row: 3 cards */}
      {bottomRow.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-gray-100 pt-5">
          {bottomRow.map((article) => (
            <Link key={article._id} href={`/news/${article._id}`} className="group block" aria-label={article.title}>
              {article.categoryName && (
                <span className="category-badge text-[10px] mb-1 block">{article.categoryName}</span>
              )}
              <h3 className="font-bold text-sm text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-3">{article.title}</h3>
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1"><Clock size={9} />{article.author?.published_date}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureSplitLayout;
