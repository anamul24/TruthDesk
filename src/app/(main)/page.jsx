import { getNewsByCategoryId } from "@/lib/data";
import NewsCard from "@/components/homepage/news/NewsCard";
import LeftSidebar from "@/components/homepage/news/LeftSidebar";
import RightSidebar from "@/components/homepage/news/RightSidebar";

const Home = async () => {
  const news = await getNewsByCategoryId("08");

  return (
    <div className="container mx-auto grid grid-cols-12 gap-6 my-[40px] px-4">
      <div className="col-span-12 lg:col-span-3 hidden lg:block">
        <LeftSidebar />
      </div>

      <div className="col-span-12 lg:col-span-6">
        <h2 className="font-bold text-xl text-gray-800 border-b-2 border-red-500 pb-2 mb-6">
          Latest News
        </h2>
        <div className="space-y-6">
          {news.length > 0 ? (
            news.map((n) => <NewsCard key={n._id} news={n} />)
          ) : (
            <h2 className="font-bold text-4xl text-center my-7">
              No news found!
            </h2>
          )}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
