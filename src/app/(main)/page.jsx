import { getNewsByCategoryId } from "@/lib/data";
import NewsCard from "@/components/homepage/news/NewsCard";
import LeftSidebar from "@/components/homepage/news/LeftSidebar";
import RightSidebar from "@/components/homepage/news/RightSidebar";

export const revalidate = 0; // Always fetch fresh from DB

const Home = async () => {
  const news = await getNewsByCategoryId("08");

  return (
    // Fixed-height viewport minus sticky navbar (~48px) — each column scrolls independently
    <div
      className="container mx-auto grid grid-cols-12 gap-0 px-0 sm:px-4"
      style={{ height: "calc(100vh - 48px)" }}
    >
      {/* Left sidebar — independently scrollable */}
      <div className="col-span-3 hidden lg:flex flex-col overflow-y-auto px-0 pr-4 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <LeftSidebar />
      </div>

      {/* Main news feed — independently scrollable */}
      <div className="col-span-12 lg:col-span-6 overflow-y-auto px-4 py-6 border-x border-gray-100 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <h2 className="font-bold text-xl text-gray-800 border-b-2 border-red-500 pb-2 mb-6">
          Latest News
        </h2>
        <div className="space-y-6 pb-10">
          {news.length > 0 ? (
            news.map((n) => <NewsCard key={n._id} news={n} />)
          ) : (
            <h2 className="font-bold text-4xl text-center my-7">
              No news found!
            </h2>
          )}
        </div>
      </div>

      {/* Right sidebar — independently scrollable */}
      <div className="col-span-3 hidden lg:flex flex-col overflow-y-auto pl-4 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
