import { getNewsDetailsById, getArticlesByCategory, getActiveCategoriesWithCount } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { BsArrowLeft, BsEye } from "react-icons/bs";
import { CiBookmark } from "react-icons/ci";
import TiptapContentRenderer from "@/components/shared/TiptapContentRenderer";
import ArticleViewTracker from "@/components/homepage/news/ArticleViewTracker";
import ShareButton from "@/components/shared/ShareButton";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }) => {
  const { id } = await params;
  const news = await getNewsDetailsById(id);

  if (!news) {
    return { title: "News Not Found", description: "This article does not exist." };
  }

  const url = `${process.env.NEXT_PUBLIC_BASE_URL || "https://truthdesk.vercel.app"}/news/${id}`;

  return {
    title: news.title,
    description: news.excerpt || news.details?.slice(0, 160),
    openGraph: {
      title: news.title,
      description: news.excerpt || news.details?.slice(0, 160),
      url,
      type: "article",
      publishedTime: news.workflow?.publishedAt || news.author?.published_date,
      authors: [news.author?.name || news.authorName],
      images: [
        {
          url: news.cover_image?.url || news.image_url,
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description: news.excerpt || news.details?.slice(0, 160),
      images: [news.cover_image?.url || news.image_url],
    },
  };
};

const RelatedArticleCard = ({ article }) => (
  <Link href={`/news/${article._id}`} className="group block mb-6 last:mb-0">
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg mb-3">
      {article.cover_image?.url || article.image_url ? (
        <Image
          src={article.cover_image?.url || article.image_url}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="300px"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-300 text-2xl">📰</span>
        </div>
      )}
    </div>
    <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
      {article.title}
    </h3>
    {article.excerpt && (
      <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">
        {article.excerpt}
      </p>
    )}
    <p className="text-[10px] text-gray-400 mt-2 uppercase font-medium">
      {article.authorName || article.author?.name || "Newsroom"}
    </p>
  </Link>
);

const CompactArticleCard = ({ article }) => (
  <Link href={`/news/${article._id}`} className="group block mb-4 last:mb-0">
    <h3 className="font-bold text-sm text-gray-900 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
      {article.title}
    </h3>
    {article.excerpt && (
      <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
        {article.excerpt}
      </p>
    )}
    <p className="text-[9px] text-gray-400 mt-1 uppercase font-medium">
      {article.workflow?.publishedAt ? new Date(article.workflow.publishedAt).toLocaleDateString() : (article.author?.published_date || "Recently")}
    </p>
  </Link>
);

const NewsDetailsPage = async ({ params }) => {
  const { id } = await params;
  const news = await getNewsDetailsById(id);

  if (!news) {
    notFound();
  }

  // Fetch related news by category for Left Sidebar
  const relatedNews = news.category_id ? await getArticlesByCategory(news.category_id, 10) : [];
  const filteredRelated = relatedNews.filter((a) => a._id.toString() !== id);
  
  const leftRelated = filteredRelated.slice(0, 4);
  const bottomRelated = filteredRelated.slice(0, 6); // For mobile

  // Fetch other categories for Right Sidebar
  const activeCategories = await getActiveCategoriesWithCount(2);
  // Exclude current category
  const otherCategories = activeCategories
    .filter((cat) => cat.category_id !== news.category_id)
    .slice(0, 3); // Get top 3 other categories

  // Fetch articles for these categories
  const otherCategoriesData = await Promise.all(
    otherCategories.map(async (cat) => {
      const catArticles = await getArticlesByCategory(cat._id, 3);
      return {
        ...cat,
        articles: catArticles.filter((a) => a._id.toString() !== id).slice(0, 3)
      };
    })
  );

  return (
    <>
      <ArticleViewTracker articleId={news._id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: news.title,
            image: [news.cover_image?.url || news.image_url],
            datePublished: news.workflow?.publishedAt || news.author?.published_date,
            dateModified: news.updatedAt || news.workflow?.publishedAt,
            author: [
              {
                "@type": "Person",
                name: news.author?.name || news.authorName,
              },
            ],
          }),
        }}
      />
      
      <div className="container mx-auto px-4 my-10 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Sidebar (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 custom-scrollbar pb-6">
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-5 border-b pb-2 border-gray-200">
                More in {news.categoryName || `This Category`}
              </h4>
              {leftRelated.length > 0 ? (
                leftRelated.map(article => <RelatedArticleCard key={article._id.toString()} article={article} />)
              ) : (
                <p className="text-sm text-gray-400">No related news found.</p>
              )}
            </div>
          </aside>

          {/* Main Article Content */}
          <main className="lg:col-span-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors mb-6"
            >
              <BsArrowLeft />
              Back to Home
            </Link>

            <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Author header */}
              <div className="flex justify-between items-center px-5 sm:px-8 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-3 items-center">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-800">{news.author?.name || news.authorName}</h3>
                    <p className="text-xs text-gray-400">
                      {news.workflow?.publishedAt ? new Date(news.workflow.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (news.author?.published_date || "Recently")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1.5 text-sm" title={`${news.total_view || 0} views`}>
                    <BsEye className="text-[1.1rem]" />
                    <span className="font-medium">{(news.total_view || 0).toLocaleString()} <span className="hidden sm:inline">views</span></span>
                  </div>
                  <div className="w-px h-4 bg-gray-200 hidden sm:block"></div>
                  <ShareButton title={news.title} text={news.excerpt} />
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
              <div className="px-5 sm:px-8 py-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
                  {news.title}
                </h1>

                {/* Content */}
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  {news.content ? (
                    <TiptapContentRenderer content={news.content} />
                  ) : (
                    <p>{news.details}</p>
                  )}
                </div>

                {/* Tags / meta footer */}
                <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-center flex-wrap gap-4">
                  <div className="flex flex-wrap gap-2">
                    {news.categoryName && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                        {news.categoryName}
                      </span>
                    )}
                    {news.isTopNews && (
                      <span className="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full font-medium">
                        ⭐ Top News
                      </span>
                    )}
                    {news.others_info?.is_trending && (
                      <span className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-medium">
                        🔥 Trending
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/category/${news.category_id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                  >
                    More from this category →
                  </Link>
                </div>
              </div>
            </article>

            {/* Mobile Related News */}
            <div className="mt-12 lg:hidden">
              <h4 className="font-bold text-lg text-gray-900 mb-6 border-b pb-2 border-gray-200">
                Related Stories
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {bottomRelated.length > 0 ? (
                  bottomRelated.map(article => <RelatedArticleCard key={article._id.toString()} article={article} />)
                ) : (
                  <p className="text-sm text-gray-400">No related news found.</p>
                )}
              </div>
            </div>

          </main>

          {/* Right Sidebar (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 custom-scrollbar pb-6 space-y-10">
              {otherCategoriesData.length > 0 ? (
                otherCategoriesData.map((catData) => (
                  <div key={catData._id}>
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-gray-900">
                        {catData.category_name}
                      </h4>
                      <Link 
                        href={`/category/${catData.category_id}`} 
                        className="text-[10px] uppercase font-bold text-red-600 hover:text-red-700"
                      >
                        View All
                      </Link>
                    </div>
                    {catData.articles.length > 0 ? (
                      catData.articles.map((article) => (
                        <CompactArticleCard key={article._id.toString()} article={article} />
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No stories found.</p>
                    )}
                  </div>
                ))
              ) : (
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-4 border-b pb-2 border-gray-200">
                    Latest Stories
                  </h4>
                  <p className="text-sm text-gray-400">More news coming soon.</p>
                </div>
              )}
            </div>
          </aside>
          
        </div>
      </div>
    </>
  );
};

export default NewsDetailsPage;
