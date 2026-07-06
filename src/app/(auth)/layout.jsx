import SimpleNav from "@/components/shared/SimpleNav";
import React from "react";
import { montserrat } from "../layout";

const AuthLayout = ({ children }) => {
  return (
    <div className={`${montserrat.className}`}>
      <SimpleNav />
      {children}
    </div>
  );
};

export default AuthLayout;
