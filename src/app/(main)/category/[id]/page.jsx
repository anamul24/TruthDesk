import React from "react";
import FeaturedGrid from "@/components/shared/FeaturedGrid";
import NewsCard from "@/components/homepage/news/NewsCard";
import { getCategories, getNewsByCategoryId } from "@/lib/data";

export const revalidate = 60;
export const dynamic = 'force-dynamic';

const NewsCategoryPage = async ({ params }) => {
  const { id } = await params;

  const categories = await getCategories();
  const news = await getNewsByCategoryId(id);

  const categoryName = categories.news_category?.find(
    (c) => c.category_id === id
  )?.category_name || "Category";

  const featured = news.slice(0, 5);
  const remaining = news.slice(5);

  return (
    <div className="container mx-auto py-8">
      <div className="px-4 mb-8">
        <span className="section-title">{categoryName}</span>
      </div>

      {featured.length > 0 ? (
        <div className="mb-12">
          <FeaturedGrid articles={featured} />
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-400 text-4xl mb-4">📰</p>
          <h2 className="font-bold text-xl text-gray-500">
            No news found for this category
          </h2>
        </div>
      )}

      {remaining.length > 0 && (
        <div className="px-4">
          <div className="mb-5">
            <span className="section-title">More {categoryName} News</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {remaining.map((n) => (
              <NewsCard key={n._id} news={n} variant="small" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsCategoryPage;
