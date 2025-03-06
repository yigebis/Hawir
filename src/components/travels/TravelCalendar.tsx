
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TravelEvent from "./TravelEvent";
import { format, addDays, startOfWeek, subDays, addWeeks, subWeeks } from "date-fns";

const TravelCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date[]>(() => {
    const startDay = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(startDay, i));
  });

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

  // Time slots from midnight to 23:00
  const timeSlots = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`
  );

  const goToPreviousWeek = () => {
    const prevWeekDate = subWeeks(currentDate, 1);
    setCurrentDate(prevWeekDate);
    const startDay = startOfWeek(prevWeekDate, { weekStartsOn: 0 });
    setCurrentWeek(Array.from({ length: 7 }, (_, i) => addDays(startDay, i)));
  };

  const goToNextWeek = () => {
    const nextWeekDate = addWeeks(currentDate, 1);
    setCurrentDate(nextWeekDate);
    const startDay = startOfWeek(nextWeekDate, { weekStartsOn: 0 });
    setCurrentWeek(Array.from({ length: 7 }, (_, i) => addDays(startDay, i)));
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Calendar Navigation */}
      <div className="flex items-center gap-3.5 p-5">
        <button 
          onClick={goToPreviousWeek}
          className="w-9 h-9 bg-[#F3F6FA] rounded-full flex items-center justify-center hover:bg-gray-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-medium">
          {format(currentDate, "EEE dd MMMM, yyyy")}
        </span>
        <button 
          onClick={goToNextWeek}
          className="w-9 h-9 bg-[#F3F6FA] rounded-full flex items-center justify-center hover:bg-gray-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-5">
        {/* Day Labels */}
        <div className="grid grid-cols-7 text-center mb-5">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div key={index} className="text-xs font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Date Cells */}
        <div className="grid grid-cols-7 gap-2.5 text-center">
          {currentWeek.map((date, index) => {
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isSelected = format(date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
            
            return (
              <div 
                key={index} 
                onClick={() => setCurrentDate(date)}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm cursor-pointer
                  ${isSelected ? 'bg-[#F35B04] text-white' : ''}
                  ${isToday && !isSelected ? 'border border-[#F35B04]' : ''}
                  hover:bg-gray-100
                `}
              >
                {format(date, 'd')}
              </div>
            );
          })}
        </div>
      </div>

      {/* All-day Section */}
      <div className="px-2 py-2 bg-[#C1C6D0] border-t border-b border-gray-400 text-xs">
        All-day
      </div>

      {/* Schedule Grid */}
      <div className="relative p-5">
        {/* Time Labels */}
        {timeSlots.slice(0, 8).map((time, index) => (
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
