import React from "react";
import Link from "next/link";
import { getCategories } from "@/lib/data";
import AuthButtons from "./AuthButtons";

const CategoryNav = async () => {
  const categories = await getCategories();

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 flex items-center justify-between py-2 gap-2">
        {/* Left nav links */}
        <ul className="flex items-center gap-3 sm:gap-4 text-sm font-semibold text-gray-700 shrink-0">
          <li>
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
          </li>
          <li className="hidden sm:block">
            <Link href="/about-us" className="hover:text-red-600 transition-colors">About</Link>
          </li>
          <li className="hidden sm:block">
            <Link href="/career" className="hover:text-red-600 transition-colors">Career</Link>
          </li>
        </ul>

        {/* Category links - scrollable on mobile */}
        <ul className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wide scrollbar-none flex-1 justify-center px-2">
          {categories.news_category.map((category) => (
            <li key={category.category_id} className="shrink-0">
              <Link
                href={`/category/${category.category_id}`}
                className="hover:text-red-600 transition-colors"
              >
                {category.category_name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth */}
        <div className="shrink-0">
          <AuthButtons />
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
