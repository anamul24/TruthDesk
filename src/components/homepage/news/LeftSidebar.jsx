import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getTopNews } from "@/lib/data";
import { Newspaper } from "lucide-react";

const LeftSidebar = async () => {
  const topNews = await getTopNews();

  return (
    <div className="space-y-6 hidden lg:block">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div
          className="px-4 py-3 border-b border-gray-100"
          style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}
        >
          <h2 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Newspaper size={14} />
            Top News
          </h2>
        </div>

        <div className="p-4 space-y-4">
          {topNews.length > 0 ? (
            topNews.map((n, i) => (
              <Link key={n._id} href={`/news/${n._id}`} className="block group">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    {n.image_url && (
                      <div className="relative w-full aspect-video mb-2 overflow-hidden rounded-md">
                        <Image
                          src={n.image_url}
                          alt={n.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="220px"
                          unoptimized
                        />
                      </div>
                    )}
                    <h4 className="font-bold text-sm text-gray-800 leading-tight group-hover:text-red-600 transition-colors line-clamp-2">
                      {n.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">{n.author?.name}</p>
                  </div>
                </div>
                {i < topNews.length - 1 && (
                  <div className="border-b border-gray-100 mt-3" />
                )}
              </Link>
            ))
          ) : (
            <div className="text-center py-6">
              <Newspaper size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">No top news yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
