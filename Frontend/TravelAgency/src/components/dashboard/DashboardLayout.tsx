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
  // NEW: Check if the current path is the Advertisement page
  // IMPORTANT: Adjust '/advertisement' if your actual route is different (e.g., '/dashboard/advertisement')
  const isAdvertisementPage = location.pathname === "/advertisement";
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Updated condition: Show header only if showHeader is true, NOT on profile page, and NOT on advertisement page */}
        {showHeader && !isProfilePage && !isAdvertisementPage && <DashboardHeader />}
        <main className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
