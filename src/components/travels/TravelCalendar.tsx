
import React, { useState, useMemo } from "react";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from "lucide-react";
import TravelEvent, { TravelEventType } from "./TravelEvent";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format } from "date-fns";

// Set up the localizer for the calendar
const localizer = momentLocalizer(moment);

const TravelCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
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

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // Custom calendar components
  const components = useMemo(() => ({
    event: ({ event }: { event: TravelEventType }) => (
      <TravelEvent event={event} />
    ),
    eventWrapper: ({ children }: { children: React.ReactNode }) => (
      <div className="rbc-event-wrapper">{children}</div>
    ),
    toolbar: () => (
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
    ),
    timeGutterHeader: () => (
      <div className="px-2 py-2 bg-[#C1C6D0] border-t border-b border-gray-400 text-xs">
        All-day
      </div>
    )
  }), [currentDate]);

  // Custom styles for the calendar
  const calendarStyles = {
    height: 700,
    className: "custom-calendar bg-white rounded-lg shadow-md"
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
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
