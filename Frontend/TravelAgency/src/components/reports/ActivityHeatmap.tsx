
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from "lucide-react";

interface HeatmapData {
  date: Date;
  value: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  week: number;
}

interface ActivityHeatmapProps {
  tripsData: HeatmapData[];
  bookingsData: HeatmapData[];
  year: string;
  onYearChange: (year: string) => void;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  tripsData,
  bookingsData,
  year,
  onYearChange
}) => {
  const [activeView, setActiveView] = useState<'trips' | 'bookings'>('trips');

  const currentData = activeView === 'trips' ? tripsData : bookingsData;
  const maxValue = Math.max(...currentData.map(d => d.value));

  // Calculate color intensity based on value (GitHub style)
  const getColorIntensity = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    const intensity = value / maxValue;
    const baseColor = activeView === 'trips' ? 'bg-blue-500' : 'bg-[#F35B04]';
    
    if (intensity <= 0.25) return `${baseColor} bg-opacity-25`;
    if (intensity <= 0.5) return `${baseColor} bg-opacity-50`;
    if (intensity <= 0.75) return `${baseColor} bg-opacity-75`;
    return `${baseColor} bg-opacity-100`;
  };

  // Generate GitHub-style grid layout with proper date ordering
  const generateGridData = () => {
    const weeks: HeatmapData[][] = [];
    const weeksInYear = 53; // Approximate weeks in a year
    const currentYear = parseInt(year);
    
    // Start from January 1st of the selected year
    const startOfYear = new Date(currentYear, 0, 1);
    const startDayOfWeek = startOfYear.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Initialize weeks array
    for (let w = 0; w < weeksInYear; w++) {
      weeks[w] = [];
      for (let d = 0; d < 7; d++) {
        weeks[w][d] = { date: new Date(), value: 0, dayOfWeek: d, week: w };
      }
    }

    // Calculate the correct date for each cell
    for (let week = 0; week < weeksInYear; week++) {
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        // Calculate the actual date for this cell
        const daysFromStart = (week * 7) + dayOfWeek - startDayOfWeek;
        const cellDate = new Date(startOfYear);
        cellDate.setDate(startOfYear.getDate() + daysFromStart);
        
        // Only include dates that are actually in the selected year
        if (cellDate.getFullYear() === currentYear) {
          // Find corresponding data for this date
          const dataForDate = currentData.find(item => 
            item.date.toDateString() === cellDate.toDateString()
          );
          
          weeks[week][dayOfWeek] = {
            date: new Date(cellDate),
            value: dataForDate ? dataForDate.value : 0,
            dayOfWeek: dayOfWeek,
            week: week
          };
        } else {
          // Empty cell for dates outside the year
          weeks[week][dayOfWeek] = {
            date: new Date(cellDate),
            value: 0,
            dayOfWeek: dayOfWeek,
            week: week
          };
        }
      }
    }

    return weeks;
  };

  const gridData = generateGridData();
  const years = ['2023', '2024', '2025'];

  const formatTooltip = (item: HeatmapData) => {
    const dateStr = item.date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    return `${item.value} ${activeView} on ${dateStr}`;
  };

  // Generate month labels aligned with weeks
  const getMonthLabels = () => {
    const monthLabels: { month: string; weekIndex: number }[] = [];
    const currentYear = parseInt(year);
    
    for (let month = 0; month < 12; month++) {
      const firstOfMonth = new Date(currentYear, month, 1);
      const startOfYear = new Date(currentYear, 0, 1);
      const startDayOfWeek = startOfYear.getDay();
      
      // Calculate which week this month starts in
      const daysDifference = Math.floor((firstOfMonth.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      const weekIndex = Math.floor((daysDifference + startDayOfWeek) / 7);
      
      if (weekIndex < 53 && weekIndex >= 0) {
        monthLabels.push({
          month: firstOfMonth.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: weekIndex
        });
      }
    }
    
    return monthLabels;
  };

  const monthLabels = getMonthLabels();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#F35B04]" />
          <CardTitle className="text-lg font-semibold">
            {activeView === 'trips' ? 'Trip' : 'Booking'} Activity - {year}
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={year} onValueChange={onYearChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((yr) => (
                <SelectItem key={yr} value={yr}>{yr}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            value={activeView}
            onValueChange={(value) => value && setActiveView(value as 'trips' | 'bookings')}
          >
            <ToggleGroupItem
              value="trips"
              className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
            >
              Trips
            </ToggleGroupItem>
            <ToggleGroupItem
              value="bookings"
              className="data-[state=on]:bg-[#F35B04] data-[state=on]:text-white"
            >
              Bookings
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* GitHub-style heatmap grid */}
          <div className="overflow-x-auto">
            <div className="flex items-start space-x-1 min-w-fit">
              {/* Day labels column - properly aligned */}
              <div className="flex flex-col space-y-1 mt-6">
                <div className="h-3 flex items-center">
                  <span className="text-xs text-gray-500 w-6">Sun</span>
                </div>
                <div className="h-3 flex items-center">
                  <span className="text-xs text-gray-500 w-6">Mon</span>
                </div>
                <div className="h-3 flex items-center">
                  <span className="text-xs text-gray-500 w-6">Tue</span>
                </div>
                <div className="h-3 flex items-center">
                  <span className="text-xs text-gray-500 w-6">Wed</span>
                </div>
                <div className="h-3 flex items-center">
                  <span className="text-xs text-gray-500 w-6">Thu</span>
                </div>
                <div className="h-3 flex items-center">
                  <span className="text-xs text-gray-500 w-6">Fri</span>
                </div>
                <div className="h-3 flex items-center">
                  <span className="text-xs text-gray-500 w-6">Sat</span>
                </div>
              </div>
              
              {/* Heatmap grid with month labels */}
              <div className="flex flex-col">
                {/* Month labels row - properly aligned with weeks */}
                <div className="flex space-x-1 mb-1 h-4">
                  {gridData.map((week, weekIndex) => {
                    const monthLabel = monthLabels.find(m => m.weekIndex === weekIndex);
                    return (
                      <div key={weekIndex} className="w-3 flex items-center justify-center">
                        {monthLabel && (
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {monthLabel.month}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Grid data */}
                <div className="flex space-x-1">
                  {gridData.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col space-y-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-110 border border-gray-200 ${getColorIntensity(day.value)}`}
                          title={formatTooltip(day)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              Total {activeView}: {currentData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <span>Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-100 rounded-sm border border-gray-200"></div>
                <div className={`w-3 h-3 rounded-sm border border-gray-200 ${activeView === 'trips' ? 'bg-blue-500 bg-opacity-25' : 'bg-[#F35B04] bg-opacity-25'}`}></div>
                <div className={`w-3 h-3 rounded-sm border border-gray-200 ${activeView === 'trips' ? 'bg-blue-500 bg-opacity-50' : 'bg-[#F35B04] bg-opacity-50'}`}></div>
                <div className={`w-3 h-3 rounded-sm border border-gray-200 ${activeView === 'trips' ? 'bg-blue-500 bg-opacity-75' : 'bg-[#F35B04] bg-opacity-75'}`}></div>
                <div className={`w-3 h-3 rounded-sm border border-gray-200 ${activeView === 'trips' ? 'bg-blue-500' : 'bg-[#F35B04]'}`}></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
