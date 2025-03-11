
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
  // Determine background and text color based on event color
  const getStyles = () => {
    switch(event.color) {
      case 'blue':
        return {
          bg: 'bg-[#EFF6FF]',
          border: 'border-l-[#60A5FA]',
          text: 'text-[#60A5FA]',
          status: 'Upcoming'
        };
      case 'green':
        return {
          bg: 'bg-[#F0FDF4]',
          border: 'border-l-[#10B981]',
          text: 'text-[#10B981]',
          status: 'Ongoing'
        };
      case 'orange':
        return {
          bg: 'bg-[#FFF7ED]',
          border: 'border-l-[#F97316]',
          text: 'text-[#F97316]',
          status: 'Completed'
        };
      default:
        return {
          bg: 'bg-[#F3F6FA]',
          border: 'border-l-gray-300',
          text: 'text-gray-500',
          status: 'Unknown'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`p-3 rounded-md ${styles.bg} border-l-2 ${styles.border} h-full overflow-hidden cursor-pointer hover:bg-opacity-80 transition-colors shadow-sm`}>
      <div className={`text-sm font-normal mb-1.5 ${styles.text}`}>
        {event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </div>
      <div className="text-sm text-gray-600 mb-1.5">
        {event.title}
      </div>
      <div className={`text-xs ${styles.text}`}>
        {styles.status}
      </div>
    </div>
  );
};

export default TravelEvent;
