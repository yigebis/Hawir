
import React from "react";
import { Search, Globe, Bell } from "lucide-react";

const DashboardHeader: React.FC = () => {
  return (
    <header className="flex w-full items-center justify-between gap-5 py-4 px-6">
      <h1 className="text-[#F35B04] text-2xl font-bold tracking-wide">
        Dashboard
      </h1>
      <div className="flex items-center gap-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for destination"
            className="w-64 py-2 pl-10 pr-4 rounded-full border border-gray-300 outline-none text-sm"
          />
          <Search 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" 
          />
        </div>
        <div className="flex items-center gap-5">
          <button className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100" aria-label="Language">
            <Globe size={20} />
          </button>
          <button className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 relative" aria-label="Notifications">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-4 w-4 bg-orange-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
