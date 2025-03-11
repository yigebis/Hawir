
import React, { useMemo } from "react";
import { Calendar, momentLocalizer, Views, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import TravelEvent, { TravelEventType } from "./TravelEvent";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, startOfWeek, endOfWeek, isSameDay, isToday } from "date-fns";

// Set up the localizer for the calendar
const localizer = momentLocalizer(moment);

interface TravelCalendarProps {
  onAddTrip: (dateTime?: { date?: Date; time?: string }) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: "day" | "week";
  events: TravelEventType[];
}

const TravelCalendar: React.FC<TravelCalendarProps> = ({ 
  onAddTrip, 
  selectedDate,
  onDateChange,
  viewMode,
  events
}) => {
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
      <div className="px-2 py-2 bg-white border-b border-[#E5E7EB] text-xs font-medium text-[#6B7280]">
        Time
      </div>
    )
  }), []);

  // Custom styles for the calendar
  const calendarStyles = {
    height: 600,
    className: "custom-calendar bg-white rounded-lg"
  };

  return (
    <div className="bg-white rounded-lg">
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
