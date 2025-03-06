
import React, { useState, useMemo, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from "lucide-react";
import TravelEvent, { TravelEventType } from "./TravelEvent";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay, isToday } from "date-fns";

// Set up the localizer for the calendar
const localizer = momentLocalizer(moment);

const TravelCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  
  // Sample travel events
  const [events, setEvents] = useState<TravelEventType[]>([
    {
      id: 1,
      title: "Bahir Dar → Gondar",
      start: new Date(new Date().setHours(1, 0, 0)),
      end: new Date(new Date().setHours(2, 50, 0)),
      color: "blue"
    },
    {
      id: 2,
      title: "Addis Ababa → Bahir Dar",
      start: new Date(new Date().setHours(4, 0, 0)),
      end: new Date(new Date().setHours(5, 30, 0)),
      color: "green"
    }
  ]);

  // Generate week dates whenever currentDate changes
  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    
    const dates: Date[] = [];
    let day = start;
    
    while (day <= end) {
      dates.push(day);
      day = addDays(day, 1);
    }
    
    setWeekDates(dates);
  }, [currentDate]);

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = subDays(currentDate, 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = addDays(currentDate, 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  };

  // Custom calendar components
  const components = useMemo(() => ({
    event: ({ event }: { event: TravelEventType }) => (
      <TravelEvent event={event} />
    ),
    eventWrapper: ({ children }: { children: React.ReactNode }) => (
      <div className="rbc-event-wrapper">{children}</div>
    ),
    toolbar: () => null, // We'll handle toolbar ourselves
    timeGutterHeader: () => (
      <div className="px-2 py-2 bg-[#C1C6D0] border-t border-b border-gray-400 text-xs">
        All-day
      </div>
    )
  }), []);

  // Custom styles for the calendar
  const calendarStyles = {
    height: 600,
    className: "custom-calendar bg-white rounded-lg shadow-md"
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Custom date selector section */}
      <div className="flex items-center gap-3.5 p-5">
        <button 
          onClick={handlePrevious}
          className="w-9 h-9 bg-[#F3F6FA] rounded-full flex items-center justify-center hover:bg-gray-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-medium">
          {format(currentDate, "EEE dd MMMM, yyyy")}
        </span>
        <button 
          onClick={handleNext}
          className="w-9 h-9 bg-[#F3F6FA] rounded-full flex items-center justify-center hover:bg-gray-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Custom week day selector */}
      <div className="px-5 pb-3">
        <div className="grid grid-cols-7 text-center mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-xs font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDates.map((date, index) => (
            <div key={index} className="flex justify-center">
              <button
                onClick={() => handleDateClick(date)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                  isSameDay(date, selectedDate) 
                    ? 'bg-[#F35B04] text-white' 
                    : isToday(date)
                    ? 'bg-gray-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                {format(date, "d")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* React Big Calendar */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.DAY}
        views={[Views.DAY]}
        date={currentDate}
        onNavigate={setCurrentDate}
        components={components}
        {...calendarStyles}
      />
    </div>
  );
};

export default TravelCalendar;
