// src/components/travels/TravelCalendar.tsx

import React, { useState, useMemo, useEffect, useContext } from "react";
import { Calendar, momentLocalizer, Views, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from "lucide-react";
import TravelEvent, { TravelEventType } from "./TravelEvent";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar-overrides.css';
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import YearlyCalendarView from "./YearlyCalendarView";

// Set up the localizer for the calendar
const localizer = momentLocalizer(moment);

export type CalendarViewMode = "day" | "week" | "yearly";

interface TravelCalendarProps {
  onAddTrip: (dateTime?: { date?: Date; time?: string; editEvent?: TravelEventType }) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  events: TravelEventType[];
  loadingEvents: boolean;
  errorEvents: string | null;
}

const TravelCalendar: React.FC<TravelCalendarProps> = ({
  onAddTrip,
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  events,
  loadingEvents,
  errorEvents
}) => {
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<TravelEventType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const formattedUpcomingEvents = useMemo(() => {
    const safeEvents = Array.isArray(events) ? events : [];

    const upcoming = safeEvents.filter(event => {
      if (!event.start || !event.end) {
        console.warn('Event missing start or end date:', event);
        return false;
      }
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const now = new Date();

      if (event.status === 'upcoming' || event.status === 'ongoing') {
        return true;
      }

      return eventEnd >= now;
    });

    return upcoming.map(event => ({
      ...event,
      title: event.start_location && event.destination ? `${event.start_location} to ${event.destination}` : 'Trip',
      start: new Date(event.start),
      end: new Date(event.end),
    })).filter(event => event.start && event.end && !isNaN(event.start.getTime()) && !isNaN(event.end.getTime()));
  }, [events]);

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

  const handleDateClick = (date: Date) => {
    onDateChange(date);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const date = new Date(slotInfo.start);
    const timeString = format(date, "HH:mm");

    onAddTrip({
      date: date,
      time: timeString
    });
  };

  const handleYearlyDateSelect = (date: Date) => {
    onDateChange(date);
    onViewModeChange("day");
  };

  const handleEditEvent = (event: TravelEventType) => {
    setSelectedEvent(event);
    setShowEditModal(true);

    onAddTrip({
      date: event.start,
      time: format(event.start, "HH:mm"),
      editEvent: event
    });
  };

  const EventComponent = ({ event }: { event: TravelEventType }) => (
    <TravelEvent
      event={event}
      onEdit={handleEditEvent}
    />
  );

  const components = useMemo(() => ({
    event: EventComponent,
    eventWrapper: ({ children }: { children: React.ReactNode }) => (
      <div className="rbc-event-wrapper">{children}</div>
    ),
    toolbar: () => null,
    timeGutterHeader: () => (
      <div className="px-2 py-2 bg-[#C1C6D0] border-t border-b border-gray-400 text-xs">
        All-day
      </div>
    )
  }), []);

  const calendarStyles = useMemo(() => ({
    height: 600,
    className: "custom-calendar bg-white rounded-lg shadow-md",
    dayPropGetter: () => ({
      style: { position: 'relative' },
    }),
    slotPropGetter: () => ({
      style: { position: 'relative' },
    }),
    eventPropGetter: (event: TravelEventType) => {
      const style: React.CSSProperties = {
        // REMOVED: position: 'relative' - Let react-big-calendar manage absolute positioning
        zIndex: 1, // Keep if you want events to stack consistently, usually '2' works well
        margin: '1px 0',
        borderRadius: '4px',
        border: '1px solid rgba(0,0,0,0.12)',
      };

      if (event.status) {
        switch (event.status) {
          case 'ongoing': style.backgroundColor = '#10B981'; style.borderColor = '#059669'; break; // green
          case 'upcoming': style.backgroundColor = '#3B82F6'; style.borderColor = '#2563EB'; break; // blue
          case 'completed': style.backgroundColor = '#F35B04'; style.borderColor = '#D03801'; break; // orange
          case 'cancelled': style.backgroundColor = '#EF4444'; style.borderColor = '#B91C1C'; break; // red for cancelled
          default: style.backgroundColor = `rgb(var(--color-${event.color || 'gray'}-500))`; // Fallback to a default color if no status or unknown
        }
      } else {
        // Fallback if status is not defined
        style.backgroundColor = `rgb(var(--color-gray-500))`;
      }
      style.color = 'white'; // Ensure text color is readable against background

      return { style };
    },
  }), []);

  if (loadingEvents) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F35B04]"></div>
          <p className="mt-4 text-gray-600">Loading calendar events...</p>
        </div>
      </div>
    );
  }

  if (errorEvents) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 flex justify-center items-center text-red-600">
        <p>Error loading calendar: {errorEvents}</p>
        <p className="mt-2 text-sm text-gray-500">Please try refreshing the page.</p>
      </div>
    );
  }

  if (viewMode === "yearly") {
    return (
      <YearlyCalendarView
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        onDateSelect={handleYearlyDateSelect}
        events={formattedUpcomingEvents}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
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
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${isSameDay(date, selectedDate)
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

      <Calendar
        localizer={localizer}
        events={formattedUpcomingEvents}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.DAY}
        views={[Views.DAY, Views.WEEK]}
        date={selectedDate}
        onNavigate={onDateChange}
        components={components}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        popup={true}
        showMultiDayTimes={true}
        step={30}
        timeslots={2}
        {...calendarStyles}
      />

      {showEditModal && selectedEvent ? <></> : null}
    </div>
  );
};

export default TravelCalendar;