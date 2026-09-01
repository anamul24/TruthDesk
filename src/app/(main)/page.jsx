import {
  getFeaturedArticles,
  getLatestArticles,
  getMostReadArticles,
  getEditorsPicks,
  getActiveCategoriesWithCount,
  getArticlesByCategory,
  getTrendingTopics,
} from "@/lib/data";
import HeroSection from "@/components/homepage/HeroSection";
import LatestNewsSection from "@/components/homepage/LatestNewsSection";
import EditorsPicksSection from "@/components/homepage/EditorsPicksSection";
import CategorySection from "@/components/homepage/CategorySection";
import TrendingTopics from "@/components/homepage/TrendingTopics";
import NewsletterSection from "@/components/homepage/NewsletterSection";

export const revalidate = 60; // ISR: revalidate every 60 seconds
export const dynamic = "force-dynamic";

export const metadata = {
  title: "TruthDesk — Bangladesh's Trusted News Source",
  description:
    "TruthDesk delivers accurate, independent news from Bangladesh and around the world. Politics, sports, technology, entertainment and more.",
};

// How many category sections to show on homepage
const MAX_CATEGORY_SECTIONS = 4;

// How many articles each layout needs (4-column needs 8, others need 6)
const ARTICLES_PER_LAYOUT = [6, 6, 8, 5];

const Home = async () => {
  // Parallel data fetching for performance
  const [
    featuredArticles,
    latestArticles,
    mostReadArticles,
    editorsPicks,
    activeCategories,
    trendingTopics,
  ] = await Promise.all([
    getFeaturedArticles(5),
    getLatestArticles(6),
    getMostReadArticles(5),
    getEditorsPicks(3),
    getActiveCategoriesWithCount(1), // categories with 1+ articles
    getTrendingTopics(10),
  ]);

  // Pick top categories for section display
  const topCategories = activeCategories.slice(0, MAX_CATEGORY_SECTIONS);

  const categoryArticlesMap = await Promise.all(
    topCategories.map(async (cat, index) => {
      const limit = ARTICLES_PER_LAYOUT[index] || 6;
      const articles = await getArticlesByCategory(cat.category_id, limit);
      return { category: cat, articles, layoutIndex: index };
    })
  );

  return (
    <main>
      {/* ─── Hero / Top Stories ────────────────────────── */}
      <HeroSection articles={featuredArticles} />

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* ─── Latest News + Most Read ───────────────────── */}
      <LatestNewsSection
        latestArticles={latestArticles}
        mostReadArticles={mostReadArticles}
      />

      {/* ─── Editor's Picks ────────────────────────────── */}
      {editorsPicks.length > 0 && (
        <EditorsPicksSection articles={editorsPicks} />
      )}

      {/* ─── Category Sections (varied layouts) ─────────── */}
      {categoryArticlesMap.map(({ category, articles, layoutIndex }) =>
        articles.length >= 1 ? (
          <CategorySection
            key={category.category_id}
            categoryName={category.category_name}
            categoryId={category.category_id}
            articles={articles}
            layoutIndex={layoutIndex}
          />
        ) : null
      )}

      {/* ─── Trending Topics ───────────────────────────── */}
      {trendingTopics.length > 0 && (
        <TrendingTopics topics={trendingTopics} />
      )}

      {/* ─── Newsletter ────────────────────────────────── */}
      <NewsletterSection />
    </main>
  );
};

export default Home;
