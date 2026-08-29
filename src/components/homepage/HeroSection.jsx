import React from "react";
import FeaturedGrid from "@/components/shared/FeaturedGrid";

/**
 * HeroSection — Top Stories
 */
const HeroSection = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-5">
        <span className="section-title">Top Stories</span>
      </div>

      <FeaturedGrid articles={articles} />
    </section>
  );
};

export default HeroSection;
