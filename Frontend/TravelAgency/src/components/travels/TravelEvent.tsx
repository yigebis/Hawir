
import React from "react";

export interface TravelEventType {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color: "blue" | "green" | "orange";
}

interface EventProps {
  event: TravelEventType;
}

const TravelEvent: React.FC<EventProps> = ({ event }) => {
  // Determine border color based on event color
  const getBorderColor = () => {
    switch(event.color) {
      case 'blue':
        return 'border-l-blue-500';
      case 'green':
        return 'border-l-green-500';
      case 'orange':
        return 'border-l-orange-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className={`p-4 rounded bg-[#F3F6FA] border-l-4 ${getBorderColor()} h-full overflow-hidden`}>
      <div className="text-sm font-medium mb-2">
        {event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </div>
      <div className="text-base font-semibold">
        {event.title}
      </div>
    </div>
  );
};

export default TravelEvent;
