
import React from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import StatisticsCards from "./StatisticsCards";
import ActivityList from "./ActivityList";

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
    <div className="bg-white overflow-hidden">
      <div className="bg-white pr-5 max-md:max-w-full">
        <div className="gap-5 flex max-md:flex-col max-md:items-stretch">
          <div className="w-[16%] max-md:w-full max-md:ml-0">
            <Sidebar />
          </div>
          <div className="w-[84%] ml-5 max-md:w-full max-md:ml-0">
            <main className="w-full mt-6 max-md:max-w-full max-md:mt-10">
              {showHeader && <DashboardHeader />}
              {showDefault ? (
                <>
                  <StatisticsCards />
                  <ActivityList />
                </>
              ) : (
                children
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
