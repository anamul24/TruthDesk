import React from "react";
import Link from "next/link";
import { getCategories } from "@/lib/data";
import AuthButtons from "./AuthButtons";

const CategoryNav = async () => {
  const categories = await getCategories();

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 flex items-center justify-between py-2">
        <ul className="flex items-center gap-4 text-sm font-semibold text-gray-700">
          <li>
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
          </li>
          <li>
            <Link href="/about-us" className="hover:text-red-600 transition-colors">About</Link>
          </li>
          <li>
            <Link href="/career" className="hover:text-red-600 transition-colors">Career</Link>
          </li>
        </ul>

        <ul className="flex items-center justify-center gap-6 overflow-x-auto whitespace-nowrap text-xs font-bold text-gray-700 uppercase tracking-wide">
          {categories.news_category.map((category) => (
            <li key={category.category_id}>
              <Link
                href={`/category/${category.category_id}`}
                className="hover:text-red-600 transition-colors"
              >
                {category.category_name}
              </Link>
            </li>
          ))}
        </ul>

        <div>
          <AuthButtons />
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
