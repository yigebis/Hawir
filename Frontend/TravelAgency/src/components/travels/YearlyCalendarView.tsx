
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, getYear, isSameDay } from "date-fns";

interface YearlyCalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
}

const YearlyCalendarView: React.FC<YearlyCalendarViewProps> = ({
  selectedDate,
  onDateChange,
  onDateSelect,
}) => {
  const [currentYear, setCurrentYear] = useState(getYear(selectedDate));
  
  const handlePreviousYear = () => {
    setCurrentYear(prevYear => prevYear - 1);
  };

  const handleNextYear = () => {
    setCurrentYear(prevYear => prevYear + 1);
  };

  // Generate calendar data for all months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const generateMonthDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Add empty spaces for days before the first day of the month
    const emptyDays = Array(firstDayOfWeek).fill(null);
    
    return [...emptyDays, ...days];
  };

  const renderMonth = (monthName: string, monthIndex: number) => {
    const days = generateMonthDays(currentYear, monthIndex);
    const today = new Date();
    const isSelectedMonth = selectedDate.getMonth() === monthIndex && selectedDate.getFullYear() === currentYear;
    
    return (
      <div key={monthName} className="border rounded-lg overflow-hidden bg-white">
        <div className="p-3 font-semibold text-lg border-b">
          {monthName}
        </div>
        <div className="grid grid-cols-7 text-center text-xs p-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="py-1 font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 p-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-8"></div>;
            }
            
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);
            
            return (
              <button
                key={`day-${index}`}
                onClick={() => onDateSelect(day)}
                className={`h-8 flex items-center justify-center rounded-full text-sm transition-colors
                  ${isSelected ? 'bg-[#F35B04] text-white' : ''}
                  ${isToday && !isSelected ? 'bg-gray-200' : ''}
                  ${!isToday && !isSelected ? 'hover:bg-gray-100' : ''}
                `}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Displaying the year with navigation
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePreviousYear}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-xl font-semibold">{currentYear}</div>
          <button 
            onClick={handleNextYear}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {months.map((month, index) => renderMonth(month, index))}
      </div>
    </div>
  );
};

export default YearlyCalendarView;
