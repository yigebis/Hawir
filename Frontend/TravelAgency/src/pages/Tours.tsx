
import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OngoingTravelsTable from "@/components/tours/OngoingTravelsTable";
import CompletedTravelsTable from "@/components/tours/CompletedTravelsTable";
import UpcomingTravelsTable from "@/components/tours/UpcomingTravelsTable";
import { useQuery } from "@tanstack/react-query";
import { fetchTravels } from "@/lib/api/travelService";
import { getDriversByAgencyId } from "@/lib/api/driver";
import { useAuth } from "@/contexts/AuthContext";

const Tours = () => {
  const [activeTab, setActiveTab] = useState("ongoing");
  const { user, token } = useAuth();

  // Fetch travels data
  const { data: travels = [], isLoading: travelsLoading } = useQuery({
    queryKey: ['travels', user?.agencyId],
    queryFn: () => fetchTravels(user?.agencyId || ''),
    enabled: !!user?.agencyId,
  });

  // Fetch drivers data
  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['drivers', user?.agencyId],
    queryFn: () => getDriversByAgencyId(token || ''),
    enabled: !!token,
  });

  // Filter travels by status
  const ongoingTravels = travels.filter(travel => travel.status === 'ongoing');
  const completedTravels = travels.filter(travel => travel.status === 'completed');
  const upcomingTravels = travels.filter(travel => travel.status === 'upcoming');

  const isLoading = travelsLoading || driversLoading;

  if (isLoading) {
    return (
      <DashboardLayout showHeader={false}>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading travels...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout showHeader={false}>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[#F35B04] text-base font-bold tracking-[2.4px] uppercase">
            TOURS
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search travels..."
                className="pl-9 w-[300px] bg-white"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="ongoing" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-transparent space-x-4 p-0">
            <TabsTrigger 
              value="upcoming" 
              className={`text-gray-600 px-5 py-2 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-[#F35B04] data-[state=active]:text-white`}
            >
              Upcoming Travels
            </TabsTrigger>
            <TabsTrigger 
              value="ongoing" 
              className={`text-gray-600 px-5 py-2 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-[#F35B04] data-[state=active]:text-white`}
            >
              Ongoing Travels
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className={`text-gray-600 px-5 py-2 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-[#F35B04] data-[state=active]:text-white`}
            >
              Completed Travels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="mt-0">
            <OngoingTravelsTable tours={ongoingTravels} drivers={drivers} />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            <CompletedTravelsTable tours={completedTravels} drivers={drivers} />
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-0">
            <UpcomingTravelsTable tours={upcomingTravels} drivers={drivers} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Tours;
