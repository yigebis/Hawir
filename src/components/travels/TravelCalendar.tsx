
import React, { useState, useMemo, useEffect } from "react";
import { Calendar, momentLocalizer, Views, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from "lucide-react";
import TravelEvent, { TravelEventType } from "./TravelEvent";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay, isToday, startOfDay } from "date-fns";

// Set up the localizer for the calendar
const localizer = momentLocalizer(moment);

interface TravelCalendarProps {
  onAddTrip: (dateTime?: { date?: Date; time?: string }) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: "day" | "week";
}

const TravelCalendar: React.FC<TravelCalendarProps> = ({ 
  onAddTrip, 
  selectedDate,
  onDateChange,
  viewMode
}) => {
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
    },
    {
      id: 3,
      title: "Addis Ababa → Bahir Dar",
      start: new Date(startOfDay(addDays(new Date(), 1)).setHours(4, 0, 0)),
      end: new Date(startOfDay(addDays(new Date(), 1)).setHours(5, 30, 0)),
      color: "orange"
    },
    {
      id: 4,
      title: "Bahir Dar → Gondar",
      start: new Date(startOfDay(addDays(new Date(), 1)).setHours(7, 0, 0)),
      end: new Date(startOfDay(addDays(new Date(), 1)).setHours(8, 30, 0)),
      color: "blue"
    },
    {
      id: 5,
      title: "Addis Ababa → Bahir Dar",
      start: new Date(startOfDay(addDays(new Date(), 2)).setHours(4, 0, 0)),
      end: new Date(startOfDay(addDays(new Date(), 2)).setHours(5, 30, 0)),
      color: "orange"
    },
    {
      id: 6,
      title: "Bahir Dar → Gondar",
      start: new Date(startOfDay(addDays(new Date(), 2)).setHours(7, 0, 0)),
      end: new Date(startOfDay(addDays(new Date(), 2)).setHours(8, 30, 0)),
      color: "blue"
    }
  ]);

  // Generate week dates whenever selectedDate changes
  useEffect(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
    
    const dates: Date[] = [];
    let day = start;
    
    while (day <= end) {
      dates.push(day);
      day = addDays(day, 1);
    }
    
    setWeekDates(dates);
  }, [selectedDate]);

  // Handle date click
  const handleDateClick = (date: Date) => {
    onDateChange(date);
  };

  // Handle slot selection
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const date = new Date(slotInfo.start);
    const timeString = format(date, "HH:mm");
    
    onAddTrip({
      date: date,
      time: timeString
    });
  };

  // Handle event selection
  const handleSelectEvent = (event: TravelEventType) => {
    // If in weekly view, switch to day view
    if (viewMode === "week") {
      onDateChange(event.start);
    }
  };

  // Custom calendar components
  const components = useMemo(() => ({
    event: ({ event }: { event: TravelEventType }) => (
      <TravelEvent event={event} />
    ),
    eventWrapper: ({ children }: { children: React.ReactNode }) => (
      <div className="rbc-event-wrapper cursor-pointer">{children}</div>
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
      {/* Custom week day selector (only shown in day view) */}
      {viewMode === "day" && (
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
      )}

      {/* React Big Calendar */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={viewMode === "day" ? Views.DAY : Views.WEEK}
        view={viewMode === "day" ? Views.DAY : Views.WEEK}
        views={viewMode === "day" ? [Views.DAY] : [Views.WEEK]}
        date={selectedDate}
        onNavigate={onDateChange}
        components={components}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        {...calendarStyles}
      />
    </div>
  );
};

export default TravelCalendar;
