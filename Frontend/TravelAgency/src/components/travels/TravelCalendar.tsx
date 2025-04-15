
import React, { useState, useMemo, useEffect, useContext } from "react"; 
import { Calendar, momentLocalizer, Views, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from "lucide-react";
import TravelEvent, { TravelEventType } from "./TravelEvent";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import YearlyCalendarView from "./YearlyCalendarView";
import { fetchTravels } from "@/lib/api/travelService";
import { AuthContext, AuthContextType } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// Set up the localizer for the calendar
const localizer = momentLocalizer(moment);

export type CalendarViewMode = "day" | "week" | "yearly";

interface TravelCalendarProps {
  onAddTrip: (dateTime?: { date?: Date; time?: string; editEvent?: TravelEventType }) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
}

const TravelCalendar: React.FC<TravelCalendarProps> = ({
  onAddTrip,
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange
}) => {
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [allEvents, setAllEvents] = useState<TravelEventType[]>([]);
  const [events, setEvents] = useState<TravelEventType[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [selectedEvent, setSelectedEvent] = useState<TravelEventType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { agency } = useContext(AuthContext) as AuthContextType; // Access agency data from context

  // Load travel events
  const loadTravels = async () => {
    try {
      setLoading(true);
      if (agency?.id) {
        const fetchedEvents = await fetchTravels(agency?.id);
        setAllEvents(fetchedEvents || []); // Ensure we always set an array
      }
    } catch (error) {
      console.error("Error loading travels", error);
      setAllEvents([]); // Set empty array on error
      toast({
        title: "Error loading travels",
        description: "Could not fetch travel data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTravels();
  }, [agency?.id]);

  // Filter events to only show 'upcoming' status
  useEffect(() => {
    // Ensure allEvents is an array before filtering
    const upcomingEvents = Array.isArray(allEvents) 
      ? allEvents.filter(event => event.status === 'upcoming')
      : [];
      
    // Format the dates to be Date objects for react-big-calendar
    const formattedEvents = upcomingEvents.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
    setEvents(formattedEvents);
  }, [allEvents]);

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

  // Handle year view date selection
  const handleYearlyDateSelect = (date: Date) => {
    onDateChange(date);
    onViewModeChange("day");
  };

  // Handle edit event
  const handleEditEvent = (event: TravelEventType) => {
    setSelectedEvent(event);
    setShowEditModal(true);

    // Call the onAddTrip prop with the event data
    onAddTrip({
      date: event.start,
      time: format(event.start, "HH:mm"),
      editEvent: event
    });
  };

  // Handle save event (both new and edited)
  const handleSaveEvent = (tripData: any) => {
    // After an update, refresh the events list
    loadTravels();

    // Reset the selected event and close the modal
    setSelectedEvent(null);
    setShowEditModal(false);
  };

  // Event component with edit capability
  const EventComponent = ({ event }: { event: TravelEventType }) => (
    <TravelEvent
      event={event}
      onEdit={handleEditEvent}
    />
  );

  // Custom calendar components
  const components = useMemo(() => ({
    event: EventComponent,
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
  const calendarStyles = useMemo(() => ({
    height: 600,
    className: "custom-calendar bg-white rounded-lg shadow-md",
    // Add styles to handle overlapping events
    dayPropGetter: () => ({
      style: {
        position: 'relative',
      },
    }),
    slotPropGetter: () => ({
      style: {
        position: 'relative',
      },
    }),
    eventPropGetter: (event: TravelEventType) => {
      const style: React.CSSProperties = {
        position: 'relative',
        zIndex: 1,
        margin: '1px 0',
        borderRadius: '4px',
        padding: '2px 5px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        border: '1px solid rgba(0,0,0,0.12)',
      };
      
      // Apply different colors based on event status
      if (event.status === 'ongoing') {
        style.backgroundColor = '#10B981'; // green
        style.borderColor = '#059669';
      } else if (event.status === 'upcoming') {
        style.backgroundColor = '#3B82F6'; // blue
        style.borderColor = '#2563EB';
      } else if (event.status === 'completed') {
        style.backgroundColor = '#F35B04'; // orange
        style.borderColor = '#D03801';
      }
      
      return { style };
    },
  }), []);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F35B04]"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (viewMode === "yearly") {
    // Make sure to pass an empty array if allEvents is null
    const safeEvents = Array.isArray(allEvents) ? allEvents : [];
    const upcomingEvents = safeEvents.filter(event => event.status === 'upcoming');
    
    return (
      <YearlyCalendarView
        selectedDate={selectedDate}
        onDateChange={onDateChange}
        onDateSelect={handleYearlyDateSelect}
        events={upcomingEvents} // Pass safe array of upcoming events
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
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

      {/* React Big Calendar */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.DAY}
        views={[Views.DAY, Views.WEEK]}
        date={selectedDate}
        onNavigate={onDateChange}
        components={components}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        // Enable multi-day events
        popup={true}
        // Proper handling of multi-day events
        showMultiDayTimes={true}
        // Add this to make sure events don't overlap
        step={60}
        timeslots={1}
        {...calendarStyles}
      />
      
      {/* Side effect handling for selected event - using an empty fragment to avoid void return error */}
      {showEditModal && selectedEvent ? <></> : null}
    </div>
  );
};

export default TravelCalendar;
