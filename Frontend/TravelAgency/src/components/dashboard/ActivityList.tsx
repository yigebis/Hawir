
import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TravelItem from "@/components/dashboard/TravelItem";

// Sample travel data
const recentTravels = [
  {
    id: "TR-7890",
    title: "Addis Ababa to Bahir Dar",
    departureDate: "15 Mar 2024, 08:00 AM",
    price: "ETB 1,200"
  },
  {
    id: "TR-4567",
    title: "Addis Ababa to Hawassa",
    departureDate: "14 Mar 2024, 07:30 AM",
    price: "ETB 850"
  },
  {
    id: "TR-2345",
    title: "Bahir Dar to Gondar",
    departureDate: "13 Mar 2024, 10:15 AM",
    price: "ETB 650"
  }
];

interface ActivityListProps {
  headerRight?: ReactNode;
}

const ActivityList: React.FC<ActivityListProps> = ({ headerRight }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
        {headerRight}
      </CardHeader>
      <CardContent className="space-y-4">
        {recentTravels.map((travel) => (
          <TravelItem
            key={travel.id}
            id={travel.id}
            title={travel.title}
            departureDate={travel.departureDate}
            price={travel.price}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default ActivityList;
