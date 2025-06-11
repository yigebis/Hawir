
import React from "react";
import DashboardHeader from "./DashboardHeader";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showHeader = true,
}) => {
  const location = useLocation();
  const isProfilePage = location.pathname === "/profile";
  const isMobile = useIsMobile();
  
  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {showHeader && !isProfilePage && <DashboardHeader />}
        <main className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
