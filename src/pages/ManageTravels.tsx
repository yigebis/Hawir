
import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TravelCalendar from "@/components/travels/TravelCalendar";
import AddTripModal from "@/components/trips/AddTripModal";
import { Plus } from "lucide-react";

const ManageTravels: React.FC = () => {
  const [showAddTripModal, setShowAddTripModal] = useState(false);

  return (
    <DashboardLayout showHeader={false}>
      <div className="flex flex-col">
        <div className="flex flex-col mb-7">
          <h1 className="text-[#F35B04] text-base font-bold tracking-[2.4px] uppercase mb-4">
            Manage Travels
          </h1>
          <div className="flex justify-between items-center">
            <div className="flex gap-5">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500">Ongoing</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-500">Upcoming</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-500">Completed</span>
              </div>
            </div>
            <div className="flex items-center gap-9">
              <div className="flex flex-col gap-1 cursor-pointer">
                <div className="w-5 h-0.5 bg-green-800 rounded"></div>
                <div className="w-5 h-0.5 bg-green-800 rounded"></div>
                <div className="w-5 h-0.5 bg-green-800 rounded"></div>
              </div>
              <div className="cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.16782 16.181C9.94158 16.181 11.5773 15.6128 12.9156 14.666L17.9501 19.6528C18.1838 19.8843 18.4918 20 18.821 20C19.5114 20 20 19.474 20 18.8006C20 18.485 19.8938 18.1799 19.6601 17.959L14.6575 12.9932C15.709 11.6255 16.3356 9.93161 16.3356 8.09048C16.3356 3.64019 12.6606 0 8.16782 0C3.68561 0 0 3.62967 0 8.09048C0 12.5408 3.67499 16.181 8.16782 16.181ZM8.16782 14.4345C4.66277 14.4345 1.76314 11.5623 1.76314 8.09048C1.76314 4.61862 4.66277 1.74645 8.16782 1.74645C11.6729 1.74645 14.5725 4.61862 14.5725 8.09048C14.5725 11.5623 11.6729 14.4345 8.16782 14.4345Z" fill="#027A48"/>
                </svg>
              </div>
              <div className="cursor-pointer" onClick={() => setShowAddTripModal(true)}>
                <Plus className="w-5 h-5 text-green-800" />
              </div>
            </div>
          </div>
        </div>
        <TravelCalendar onAddTrip={() => setShowAddTripModal(true)} />
        <AddTripModal 
          isOpen={showAddTripModal} 
          onClose={() => setShowAddTripModal(false)} 
          onSave={(tripData) => {
            setShowAddTripModal(false);
            // TODO: Add trip to calendar
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default ManageTravels;
