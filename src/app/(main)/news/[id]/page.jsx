import { getNewsDetailsById } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { BsArrowLeft } from "react-icons/bs";
import { CiBookmark, CiShare2 } from "react-icons/ci";
import TiptapContentRenderer from "@/components/shared/TiptapContentRenderer";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }) => {
  const { id } = await params;
  const news = await getNewsDetailsById(id);

  if (!news) {
    return { title: "News Not Found", description: "This article does not exist." };
  }

  return {
    title: news.title,
    description: news.details?.slice(0, 160),
  };
};

const NewsDetailsPage = async ({ params }) => {
  const { id } = await params;
  const news = await getNewsDetailsById(id);

  if (!news) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 my-10 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors mb-6"
      >
        <BsArrowLeft />
        Back to Home
      </Link>

      <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Author header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex gap-3 items-center">
            <div>
              <h3 className="font-semibold text-sm text-gray-800">{news.author?.name}</h3>
              <p className="text-xs text-gray-400">{news.author?.published_date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <button className="hover:text-gray-700 transition-colors" title="Share">
              <CiShare2 className="text-xl" />
            </button>
            <button className="hover:text-gray-700 transition-colors" title="Bookmark">
              <CiBookmark className="text-xl" />
            </button>
          </div>
        </div>

        {/* Cover image */}
        {news.image_url && (
          <div className="relative w-full aspect-[16/9]">
            <Image
              src={news.image_url}
              alt={news.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              unoptimized
              priority
            />
          </div>
        )}

        {/* Article body */}
        <div className="px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-6">
            {news.title}
          </h1>

          {/* Render full Tiptap content if available, otherwise fall back to details text */}
          {news.content ? (
            <TiptapContentRenderer content={news.content} />
          ) : (
            <p className="text-gray-600 leading-relaxed text-base">{news.details}</p>
          )}

          {/* Tags / meta footer */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                Category #{news.category_id}
              </span>
              {news.isTopNews && (
                <span className="text-xs bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-medium">
                  ⭐ Top News
                </span>
              )}
              {news.others_info?.is_trending && (
                <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-medium">
                  🔥 Trending
                </span>
              )}
              {news.others_info?.is_todays_pick && (
                <span className="text-xs bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-medium">
                  ⭐ Today&apos;s Pick
                </span>
              )}
            </div>

            <Link
              href={`/category/${news.category_id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              More like this →
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};

export default NewsDetailsPage;
