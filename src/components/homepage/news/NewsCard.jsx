import Image from "next/image";
import Link from "next/link";
import React from "react";
import { CiBookmark, CiShare2 } from "react-icons/ci";

const NewsCard = ({ news }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex gap-2.5 items-center">
          <div>
            <h3 className="font-semibold text-sm text-gray-800">{news.author?.name}</h3>
            <p className="text-xs text-gray-400">{news.author?.published_date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
          <button className="hover:text-gray-700 transition-colors" title="Share">
            <CiShare2 className="text-lg" />
          </button>
          <button className="hover:text-gray-700 transition-colors" title="Bookmark">
            <CiBookmark className="text-lg" />
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-[16/9]">
        <Image
          src={news.image_url}
          alt={news.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
          unoptimized
        />
      </div>

      <div className="p-4">
        <h2 className="font-bold text-base text-gray-900 leading-snug mb-2 hover:text-red-600 transition-colors">
          {news.title}
        </h2>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
          {news.details}
        </p>

        <Link
          href={`/news/${news._id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors group"
        >
          Read more
          <svg
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default NewsCard;
