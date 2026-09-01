import React from "react";
import Link from "next/link";
import FeatureSplitLayout from "@/components/homepage/layouts/FeatureSplitLayout";
import ThreeColumnLayout from "@/components/homepage/layouts/ThreeColumnLayout";
import FourColumnLayout from "@/components/homepage/layouts/FourColumnLayout";
import HorizontalListLayout from "@/components/homepage/layouts/HorizontalListLayout";

/**
 * CategorySection — renders a different editorial layout per section index
 * layoutIndex 0 → Feature Split (big main + 2 right + 3 bottom)
 * layoutIndex 1 → Three Column Grid (3×2)
 * layoutIndex 2 → Four Column Grid (4×2)
 * layoutIndex 3 → Horizontal List (image + text rows)
 * layoutIndex 4+ → cycles back through patterns
 */
const CategorySection = ({ categoryName, categoryId, articles, layoutIndex = 0 }) => {
  if (!articles || articles.length === 0) return null;

  const layouts = [
    FeatureSplitLayout,
    ThreeColumnLayout,
    FourColumnLayout,
    HorizontalListLayout,
  ];

  const LayoutComponent = layouts[layoutIndex % layouts.length];

  return (
    <section className="container mx-auto px-4 py-8 border-t border-gray-100">
      {/* Section header */}
      <div className="mb-5 flex items-center gap-4">
        <Link
          href={`/category/${categoryId}`}
          className="text-xs font-black uppercase tracking-widest text-gray-800 hover:text-red-600 transition-colors"
        >
          {categoryName}
        </Link>
        <div className="flex-1 h-px bg-gray-100" />
        <Link
          href={`/category/${categoryId}`}
          className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors shrink-0"
        >
          See all →
        </Link>
      </div>

      <LayoutComponent articles={articles} />
    </section>
  );
};

export default CategorySection;
