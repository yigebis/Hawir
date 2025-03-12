
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatisticsCards from "@/components/dashboard/StatisticsCards";
import ActivityList from "@/components/dashboard/ActivityList";
import { Plus } from "lucide-react";

const Index: React.FC = () => {
  return (
    <DashboardLayout showHeader={true}>
      <div className="flex flex-col gap-8">
        <StatisticsCards />
        
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Recent Activity</h3>
          <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center gap-2">
            <Plus size={16} />
            Add New
          </button>
        </div>
        
        <ActivityList />
      </div>
    </DashboardLayout>
  );
};

export default Index;
