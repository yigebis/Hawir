import React from "react";
import DashboardHeader from "./DashboardHeader";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showHeader = true,
}) => {
  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {showHeader && <DashboardHeader />}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
