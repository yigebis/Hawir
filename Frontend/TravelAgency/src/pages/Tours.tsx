
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ToursTable from "@/components/tours/ToursTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Tours = () => {
  return (
    <DashboardLayout showHeader={false}>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[#F35B04] text-base font-bold tracking-[2.4px] uppercase">
            TOURS
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                className="pl-9 w-[300px] bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <button className="text-gray-600 px-5 py-2 hover:bg-gray-100 rounded-md transition-colors">
            Upcoming Travels
          </button>
          <button className="text-gray-600 px-5 py-2 hover:bg-gray-100 rounded-md transition-colors">
            Ongoing Travels
          </button>
          <button className="text-gray-600 px-5 py-2 hover:bg-gray-100 rounded-md transition-colors">
            Completed Travels
          </button>
        </div>

        <ToursTable />
      </div>
    </DashboardLayout>
  );
};

export default Tours;
