
import React from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children?: React.ReactNode;
  showDefault?: boolean;
  showHeader?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  showDefault = false,
  showHeader = true 
}) => {
  return (
    <div className="bg-white flex h-screen overflow-hidden">
      <div className="w-[260px] flex-shrink-0 border-r border-[#E5E7EB]">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-auto">
        <main className="h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
