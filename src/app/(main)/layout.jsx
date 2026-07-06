import BreakingNews from "@/components/shared/BreakingNews";
import Header from "@/components/shared/Header";
import CategoryNav from "@/components/shared/CategoryNav";
import React from "react";

const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <CategoryNav />
      <BreakingNews />
      {children}
    </>
  );
};

export default MainLayout;
