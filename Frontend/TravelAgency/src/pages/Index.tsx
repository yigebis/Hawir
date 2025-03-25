
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatisticsCards from "@/components/dashboard/StatisticsCards";
import ActivityList from "@/components/dashboard/ActivityList";

const Index: React.FC = () => {
  return (
    <DashboardLayout showHeader={true}>
      <div className="flex flex-col gap-8">
        <StatisticsCards />
        <ActivityList />
      </div>
    </DashboardLayout>
  );
};

export default Index;
