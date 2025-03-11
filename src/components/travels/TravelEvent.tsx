
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
          text: 'text-[#60A5FA]'
        };
      case 'green':
        return {
          bg: 'bg-[#F0FDF4]',
          border: 'border-l-[#10B981]',
          text: 'text-[#10B981]'
        };
      case 'orange':
        return {
          bg: 'bg-[#FFF7ED]',
          border: 'border-l-[#F97316]',
          text: 'text-[#F97316]'
        };
      default:
        return {
          bg: 'bg-[#F9FAFB]',
          border: 'border-l-gray-300',
          text: 'text-gray-500'
        };
    }
  };

  const styles = getStyles();
  
  // Format the status text based on color
  const getStatusText = () => {
    switch(event.color) {
      case 'blue':
        return 'Upcoming';
      case 'green':
        return 'Ongoing';
      case 'orange':
        return 'Completed';
      default:
        return '';
    }
  };
  
  return (
    <div className={`p-3 rounded ${styles.bg} border-l-2 ${styles.border} h-full overflow-hidden cursor-pointer transition-colors`}>
      <div className="text-sm font-normal mb-1 text-[#333]">
        {event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </div>
      <div className="text-sm font-medium text-[#6B7280] mb-1">
        {event.title}
      </div>
      <div className={`text-xs ${styles.text}`}>
        {getStatusText()}
      </div>
    </div>
  );
};

export default TravelEvent;
