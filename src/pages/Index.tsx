
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatisticsCards from "@/components/dashboard/StatisticsCards";
import ActivityList from "@/components/dashboard/ActivityList";
import { Plus } from "lucide-react";

const Index: React.FC = () => {
  return (
    <DashboardLayout showHeader={true}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col space-y-4">
          <div className="relative z-0 pt-8 bg-cover bg-center rounded-lg" 
               style={{ 
                 backgroundImage: `url('/lovable-uploads/68b608b9-5ca9-4ae2-a219-c41270d66ae5.png')`,
                 height: '240px' 
               }}>
            <div className="absolute inset-0 bg-black/10 rounded-lg"></div>
            <div className="relative z-10 px-6 py-4 text-center md:text-left md:pl-10 flex flex-col h-full justify-center">
              <h2 className="text-2xl font-bold text-black mb-2">Manage your travels with ease</h2>
              <p className="text-sm text-black">Discover new destination with Hawir</p>
            </div>
          </div>
          
          <StatisticsCards />
        </div>
        
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
