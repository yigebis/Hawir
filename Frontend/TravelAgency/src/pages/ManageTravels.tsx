
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TravelCalendar, { CalendarViewMode } from "@/components/travels/TravelCalendar";
import AddTripModal from "@/components/trips/AddTripModal";
import { ChevronLeft, ChevronRight, Plus, Search, LayoutGrid } from "lucide-react";
import { format } from "date-fns";
import { TravelEventType } from "@/components/travels/TravelEvent";
import { toast } from "@/hooks/use-toast";

const ManageTravels: React.FC = () => {
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date?: Date;
    time?: string;
    editEvent?: TravelEventType;
  }>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");
  const [isEditMode, setIsEditMode] = useState(false);

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

  const handleAddTrip = (dateTime?: { 
    date?: Date; 
    time?: string;
    editEvent?: TravelEventType;
  }) => {
    if (dateTime) {
      setSelectedDateTime(dateTime);
      setIsEditMode(!!dateTime.editEvent);
    } else {
      setSelectedDateTime({ date: currentDate });
      setIsEditMode(false);
    }
    setShowAddTripModal(true);
  };

  const handleCloseModal = () => {
    setShowAddTripModal(false);
    setIsEditMode(false);
    setSelectedDateTime({});
  };

  const toggleSearch = () => {
    setShowSearchInput(!showSearchInput);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "yearly" ? "day" : "yearly");
  };

  const handleSaveTrip = (tripData: any) => {
    setShowAddTripModal(false);
    if (tripData.deleted) {
      toast({
        title: "Trip deleted",
        description: "The trip has been removed from the calendar.",
      });
    } else {
      toast({
        title: isEditMode ? "Trip updated" : "Trip added",
        description: isEditMode 
          ? "Your changes have been saved to the calendar." 
          : "Your new trip has been added to the calendar.",
      });
    }
    // Calendar component will refresh its events after the save
  };

  return (
    <DashboardLayout showHeader={false}>
      <div className="flex flex-col">
        <div className="flex flex-col mb-6">
          <h1 className="text-[#F35B04] text-base font-bold tracking-[2.4px] uppercase mb-6">
            MANAGE TRAVELS
          </h1>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {viewMode !== "yearly" && (
                <div className="flex items-center space-x-4">
                  <button 
                    className="p-1 rounded-full hover:bg-gray-100"
                    onClick={handlePreviousDay}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-base font-medium">
                    {format(currentDate, "EEE dd MMMM, yyyy")}
                  </span>
                  <button 
                    className="p-1 rounded-full hover:bg-gray-100"
                    onClick={handleNextDay}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex space-x-5">
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
              
              <div className="flex items-center space-x-4">
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
                  <button 
                    className="text-green-800 focus:outline-none" 
                    onClick={toggleSearch}
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  className="text-green-800 focus:outline-none" 
                  onClick={toggleViewMode}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  className="text-green-800 focus:outline-none" 
                  onClick={() => handleAddTrip()}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <TravelCalendar 
          onAddTrip={handleAddTrip} 
          selectedDate={currentDate}
          onDateChange={setCurrentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        
        <AddTripModal 
          isOpen={showAddTripModal} 
          onClose={handleCloseModal} 
          initialDate={selectedDateTime.date}
          initialTime={selectedDateTime.time}
          editMode={isEditMode}
          tripToEdit={selectedDateTime.editEvent}
          onSave={handleSaveTrip}
        />
      </div>
    </DashboardLayout>
  );
};

export default ManageTravels;
