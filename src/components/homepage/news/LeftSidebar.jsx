import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getNewsByCategoryId } from "@/lib/data";

const LeftSidebar = async () => {
  const news = await getNewsByCategoryId("08");
  const topNews = news.slice(0, 3);

  return (
    <div className="sticky top-4 space-y-6 hidden lg:block">
      <div className="border-t-2 border-black pt-2">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-4">
          Editor's Picks
        </h3>
        <div className="space-y-4">
          {topNews.map((n) => (
            <Link key={n._id} href={`/news/${n._id}`} className="block group">
              <div className="relative w-full aspect-video mb-2 overflow-hidden rounded-md">
                <Image
                  src={n.image_url}
                  alt={n.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="250px"
                  unoptimized
                />
              </div>
              <h4 className="font-bold text-sm text-gray-800 leading-tight group-hover:text-red-600 transition-colors">
                {n.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {n.author?.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
