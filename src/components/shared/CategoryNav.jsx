import React from "react";
import { getCategories } from "@/lib/data";
import CategoryNavClient from "./CategoryNavClient";

// Server component: fetches categories, renders client nav
const CategoryNav = async () => {
  const categoriesData = await getCategories();
  const categories = categoriesData.news_category || [];

  return <CategoryNavClient categories={categories} />;
};

export default CategoryNav;
