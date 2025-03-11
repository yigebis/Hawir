
import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TravelCalendar from "@/components/travels/TravelCalendar";
import AddTripModal from "@/components/trips/AddTripModal";
import { ChevronLeft, ChevronRight, Plus, Search, List, Calendar } from "lucide-react";
import { format, addWeeks, subWeeks, startOfDay } from "date-fns";
import { TravelEventType } from "@/components/travels/TravelEvent";

const ManageTravels: React.FC = () => {
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date?: Date;
    time?: string;
  }>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("week");
  
  // Sample travel events
  const [events] = useState<TravelEventType[]>([
    {
      id: 1,
      title: "Addis Ababa → Bahir Dar",
      start: new Date(new Date().setHours(4, 0, 0)),
      end: new Date(new Date().setHours(5, 30, 0)),
      color: "orange"
    },
    {
      id: 2,
      title: "Addis Ababa → Bahir Dar",
      start: new Date(new Date().setHours(4, 0, 0)),
      end: new Date(new Date().setHours(5, 30, 0)),
      color: "orange"
    },
    {
      id: 3,
      title: "Addis Ababa → Bahir Dar",
      start: new Date(startOfDay(addWeeks(new Date(), 0)).setHours(4, 0, 0)),
      end: new Date(startOfDay(addWeeks(new Date(), 0)).setHours(5, 30, 0)),
      color: "orange"
    },
    {
      id: 4,
      title: "Bahir Dar → Gondar",
      start: new Date(startOfDay(addWeeks(new Date(), 0)).setHours(7, 0, 0)),
      end: new Date(startOfDay(addWeeks(new Date(), 0)).setHours(8, 30, 0)),
      color: "blue"
    },
    {
      id: 5,
      title: "Addis Ababa → Bahir Dar",
      start: new Date(startOfDay(addWeeks(new Date(), 0)).setHours(4, 0, 0)),
      end: new Date(startOfDay(addWeeks(new Date(), 0)).setHours(5, 30, 0)),
      color: "orange"
    },
    {
      id: 6,
      title: "Bahir Dar → Gondar",
      start: new Date(startOfDay(addWeeks(new Date(), 0)).setHours(7, 0, 0)),
      end: new Date(startOfDay(addWeeks(new Date(), 0)).setHours(8, 30, 0)),
      color: "blue"
    },
    {
      id: 7,
      title: "Bahir Dar → Gondar",
      start: new Date(startOfDay(addWeeks(new Date(), 0)).setHours(7, 0, 0)),
      end: new Date(startOfDay(addWeeks(new Date(), 0)).setHours(8, 30, 0)),
      color: "blue"
    },
    {
      id: 8,
      title: "Bahir Dar → Gondar",
      start: new Date(startOfDay(addWeeks(new Date(), 0)).setHours(7, 0, 0)),
      end: new Date(startOfDay(addWeeks(new Date(), 0)).setHours(8, 30, 0)),
      color: "blue"
    }
  ]);

  const handleNextPeriod = () => {
    if (viewMode === "day") {
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCurrentDate(nextDay);
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handlePreviousPeriod = () => {
    if (viewMode === "day") {
      const prevDay = new Date(currentDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setCurrentDate(prevDay);
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
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

  const toggleViewMode = () => {
    setViewMode(viewMode === "day" ? "week" : "day");
  };

  const getDateRangeText = () => {
    return format(currentDate, "MMMM yyyy");
  };

  return (
    <DashboardLayout showHeader={false}>
      <div className="flex flex-col">
        <div className="flex flex-col mb-3">
          <h1 className="text-[#F35B04] text-2xl font-semibold uppercase mb-6 px-4 pt-4">
            MANAGE TRAVELS
          </h1>
          
          <div className="flex justify-between items-center px-4 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <ChevronLeft 
                  className="w-5 h-5 cursor-pointer text-gray-600" 
                  onClick={handlePreviousPeriod}
                />
                <span className="text-lg font-medium">
                  {getDateRangeText()}
                </span>
                <ChevronRight 
                  className="w-5 h-5 cursor-pointer text-gray-600" 
                  onClick={handleNextPeriod}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                  <span className="text-xs text-gray-500">Ongoing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#60A5FA]"></div>
                  <span className="text-xs text-gray-500">Upcoming</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#F97316]"></div>
                  <span className="text-xs text-gray-500">Completed</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100">
                  {viewMode === "day" ? (
                    <List className="w-5 h-5" onClick={toggleViewMode} />
                  ) : (
                    <Calendar className="w-5 h-5" onClick={toggleViewMode} />
                  )}
                </button>
                <button className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100">
                  <Search className="w-5 h-5" onClick={toggleSearch} />
                </button>
                <button 
                  className="flex items-center justify-center w-8 h-8 bg-[#F35B04] text-white rounded-md"
                  onClick={() => handleAddTrip()}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[#E5E7EB]">
          <TravelCalendar 
            onAddTrip={handleAddTrip} 
            selectedDate={currentDate}
            onDateChange={setCurrentDate}
            viewMode={viewMode}
            events={events}
          />
        </div>
        
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
