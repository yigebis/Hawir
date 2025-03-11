
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TravelCalendar from "@/components/travels/TravelCalendar";
import AddTripModal from "@/components/trips/AddTripModal";
import { ChevronLeft, ChevronRight, Plus, Search, ListIcon } from "lucide-react";
import { format } from "date-fns";
import { TravelEventType } from "@/components/travels/TravelEvent";

const ManageTravels: React.FC = () => {
  const navigate = useNavigate();
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date?: Date;
    time?: string;
  }>({});
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const handlePreviousDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  const handleAddTrip = (dateTime?: { date?: Date; time?: string }) => {
    if (dateTime) {
      setSelectedDateTime(dateTime);
    } else {
      setSelectedDateTime({ date: currentDate });
    }
    setShowAddTripModal(true);
  };

  const toggleSearch = () => {
    setShowSearchInput(!showSearchInput);
  };
  
  // New function to navigate to task view
  const navigateToTaskView = () => {
    navigate("/travel-task-view");
  };
  
  // Handle event click
  const handleEventClick = (event: TravelEventType) => {
    navigate("/travel-task-view", { state: { event } });
  };

  return (
    <DashboardLayout showHeader={false}>
      <div className="flex flex-col">
        <div className="flex flex-col mb-3">
          <h1 className="text-[#F35B04] text-base font-bold tracking-[2.4px] uppercase mb-6">
            MANAGE TRAVELS
          </h1>
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 mr-4">
                <ChevronLeft 
                  className="w-5 h-5 cursor-pointer" 
                  onClick={handlePreviousDay}
                />
                <span className="text-base font-medium">
                  {format(currentDate, "EEE dd MMMM, yyyy")}
                </span>
                <ChevronRight 
                  className="w-5 h-5 cursor-pointer" 
                  onClick={handleNextDay}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
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
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  {showSearchInput && (
                    <input
                      type="text"
                      placeholder="Search..."
                      className="absolute right-0 top-[-8px] w-44 h-8 pl-2 pr-8 border border-gray-300 rounded-md text-sm"
                      autoFocus
                      onBlur={() => setTimeout(() => setShowSearchInput(false), 100)}
                    />
                  )}
                  <Search 
                    className="w-5 h-5 text-green-800 cursor-pointer relative z-10" 
                    onClick={toggleSearch}
                  />
                </div>
                <ListIcon 
                  className="w-5 h-5 text-green-800 cursor-pointer" 
                  onClick={navigateToTaskView}
                />
                <Plus 
                  className="w-5 h-5 text-green-800 cursor-pointer" 
                  onClick={() => handleAddTrip()}
                />
              </div>
            </div>
          </div>
        </div>
        
        <TravelCalendar 
          onAddTrip={handleAddTrip} 
          selectedDate={currentDate}
          onDateChange={setCurrentDate}
          onEventClick={handleEventClick}
        />
        
        <AddTripModal 
          isOpen={showAddTripModal} 
          onClose={() => setShowAddTripModal(false)} 
          initialDate={selectedDateTime.date}
          initialTime={selectedDateTime.time}
          onSave={(tripData) => {
            setShowAddTripModal(false);
            // TODO: Add trip to calendar
            console.log("Trip saved:", tripData);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default ManageTravels;
