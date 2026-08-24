import NewsCard from "@/components/homepage/news/NewsCard";
import RightSidebar from "@/components/homepage/news/RightSidebar";
import React from "react";
import LeftSidebar from "@/components/homepage/news/LeftSidebar";
import { getCategories, getNewsByCategoryId } from "@/lib/data";

export const revalidate = 0;
export const dynamic = 'force-dynamic';
const NewsCategoryPage = async ({ params }) => {
  const { id } = await params;

  const categories = await getCategories();
  const news = await getNewsByCategoryId(id);

  const categoryName = categories.news_category.find(
    (c) => c.category_id === id
  )?.category_name || "Category";

  return (
    <div className="container mx-auto grid grid-cols-12 gap-6 my-10 px-4">
      <div className="col-span-12 lg:col-span-3 hidden lg:block">
        <LeftSidebar />
      </div>

      <div className="col-span-12 lg:col-span-6">
        <h2 className="font-bold text-xl text-gray-800 border-b-2 border-red-500 pb-2 mb-6">
          {categoryName}
        </h2>
        <div className="space-y-6">
          {news.length > 0 ? (
            news.map((n) => <NewsCard key={n._id} news={n} />)
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-4xl mb-4">📰</p>
              <h2 className="font-bold text-xl text-gray-500">
                No news found for this category
              </h2>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3">
        <RightSidebar />
      </div>
    </div>
  );
};

export default NewsCategoryPage;
