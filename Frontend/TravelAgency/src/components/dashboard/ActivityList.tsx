import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TravelItem from "@/components/dashboard/TravelItem";
import { TravelEventType } from "@/components/travels/TravelEvent"; // Import TravelEventType
import { format } from "date-fns"; // For formatting dates

// Define the props interface for ActivityList
interface ActivityListProps {
  headerRight?: ReactNode;
  recentTravels: TravelEventType[]; // <--- NEW PROP: Array of TravelEventType
}

const ActivityList: React.FC<ActivityListProps> = ({ headerRight, recentTravels }) => {
  return (
    <Card className="col-span-full md:col-span-1"> {/* Adjusted col-span for better layout */}
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
        {headerRight}
      </CardHeader>
      <CardContent className="space-y-4">
        {recentTravels.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No recent activities to display.</p>
        ) : (
          recentTravels.map((travel) => (
            <TravelItem
              key={travel.id}
              id={travel.id}
              // Construct title from start_location and destination
              title={`${travel.start_location || travel.location || 'Unknown'} to ${travel.destination || 'Unknown'}`}
              // Format planned_start_time for display
              departureDate={travel.start ? format(new Date(travel.start), "dd MMM yyyy, HH:mm a") : 'N/A'}
              // Format price for display
              price={travel.price ? `ETB ${travel.price.toLocaleString()}` : 'N/A'}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityList;
