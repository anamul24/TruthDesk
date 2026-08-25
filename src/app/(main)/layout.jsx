import BreakingNews from "@/components/shared/BreakingNews";
import Header from "@/components/shared/Header";
import CategoryNav from "@/components/shared/CategoryNav";
import Footer from "@/components/shared/Footer";
import React from "react";

const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <CategoryNav />
      <BreakingNews />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;
