import React from "react";
import Marquee from "react-fast-marquee";

const breakingItems = [
  { _id: "1", title: "Global Leaders Sign Historic Climate Agreement at Geneva Summit" },
  { _id: "2", title: "Major Earthquake Strikes Southeast Asia — Rescue Teams Deployed" },
  { _id: "3", title: "Bangladesh Cricket Team Clinches Historic Test Series Win Against England" },
  { _id: "4", title: "UN Security Council Passes AI Governance Resolution Unanimously" },
  { _id: "5", title: "EU-ASEAN Free Trade Agreement Signed After Decade of Negotiations" },
];

const BreakingNews = () => {
  return (
    <div className="bg-white border-y border-gray-200">
      <div className="container mx-auto px-4 flex items-center">
        <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 font-bold uppercase tracking-wider text-xs">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          Latest
        </div>

        <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>

        <div className="flex-1 overflow-hidden">
          <Marquee pauseOnHover={true} speed={45} gradient={false}>
            {breakingItems.map((item, i) => (
              <span
                key={item._id}
                className="text-xs font-medium text-gray-700 mx-8 cursor-pointer hover:text-red-600 transition-colors"
              >
                {i > 0 && <span className="mr-8 text-gray-300">•</span>}
                {item.title}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
};

export default BreakingNews;
