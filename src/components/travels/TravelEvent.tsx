
import React from "react";

interface EventProps {
  event: {
    id: number;
    startTime: string;
    endTime: string;
    title: string;
    color: string;
  };
}

const TravelEvent: React.FC<EventProps> = ({ event }) => {
  // Calculate position based on time (simplified for the example)
  const getTopPosition = () => {
    const hour = parseInt(event.startTime.split(':')[0]);
    return hour * 50 + 10; // 50px height per hour + 10px padding
  };
  
  const getHeight = () => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMinutes = parseInt(event.endTime.split(':')[1]);
    
    return ((endHour - startHour) + (endMinutes / 60)) * 50; // 50px per hour
  };

  // Determine border color and background based on event color
  const getBorderColor = () => {
    switch(event.color) {
      case 'blue':
        return 'border-l-blue-500';
      case 'green':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div 
      className={`absolute left-[80px] right-5 p-4 rounded bg-[#F3F6FA] border-l-4 ${getBorderColor()}`}
      style={{ 
        top: `${getTopPosition()}px`,
        height: `${getHeight()}px`
      }}
    >
      <div className="text-sm font-medium mb-2">
        {event.startTime} - {event.endTime}
      </div>
      <div className="text-base font-semibold">
        {event.title}
      </div>
    </div>
  );
};

export default TravelEvent;
