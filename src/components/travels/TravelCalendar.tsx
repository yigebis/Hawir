
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TravelEvent from "./TravelEvent";

const TravelCalendar: React.FC = () => {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const dates = [23, 24, 25, 26, 27, 28, 1];
  const timeSlots = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"];
  
  const events = [
    {
      id: 1,
      startTime: "01:00",
      endTime: "02:50",
      title: "Bahir Dar → Gondar",
      color: "blue"
    },
    {
      id: 2,
      startTime: "04:00",
      endTime: "05:30",
      title: "Addis Ababa → Bahir Dar",
      color: "green"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Calendar Navigation */}
      <div className="flex items-center gap-3.5 p-5">
        <button className="w-9 h-9 bg-[#F3F6FA] rounded-full flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-medium">Wed 26 February,2025</span>
        <button className="w-9 h-9 bg-[#F3F6FA] rounded-full flex items-center justify-center">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-5">
        {/* Day Labels */}
        <div className="grid grid-cols-7 text-center mb-5">
          {days.map((day, index) => (
            <div key={index} className="text-xs font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Date Cells */}
        <div className="grid grid-cols-7 gap-2.5 text-center">
          {dates.map((date, index) => (
            <div 
              key={index} 
              className={`
                w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm
                ${date === 26 ? 'bg-[#F35B04] text-white' : ''}
              `}
            >
              {date}
            </div>
          ))}
        </div>
      </div>

      {/* All-day Section */}
      <div className="px-2 py-2 bg-[#C1C6D0] border-t border-b border-gray-400 text-xs">
        All-day
      </div>

      {/* Schedule Grid */}
      <div className="relative p-5">
        {/* Time Labels */}
        {timeSlots.map((time, index) => (
          <div key={index} className="text-sm text-gray-500 mb-10">
            {time}
          </div>
        ))}

        {/* Events */}
        {events.map((event) => (
          <TravelEvent
            key={event.id}
            event={event}
          />
        ))}
      </div>
    </div>
  );
};

export default TravelCalendar;
