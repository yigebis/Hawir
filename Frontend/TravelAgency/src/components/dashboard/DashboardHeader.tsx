
import React from "react";
import { Bell, Languages } from "lucide-react";

const DashboardHeader: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 w-full px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h2 className="font-medium text-lg text-gray-800">Dashboard</h2>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
          <Languages className="w-5 h-5 text-gray-600" />
        </button>
        
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
