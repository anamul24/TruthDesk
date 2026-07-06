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
    <div className="bg-white border-b border-gray-100">
      <div className="container mx-auto flex items-center gap-0 overflow-hidden">
        {/* Badge */}
        <div
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold uppercase tracking-wider z-10"
          style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
        >
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          Breaking
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 flex-shrink-0"></div>

        {/* Marquee */}
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
