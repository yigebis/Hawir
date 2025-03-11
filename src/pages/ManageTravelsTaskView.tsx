
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ChevronLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TravelEventDetail {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  route: string;
  status: "Ongoing" | "Upcoming" | "Completed";
  date: string;
  driverName: string;
  busNumber: string;
  passengerCount: number;
  terminalName: string;
}

const ManageTravelsTaskView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const eventData = location.state?.eventData as TravelEventDetail || {
    id: "TR001",
    title: "Addis Ababa → Bahir Dar",
    startTime: "04:00",
    endTime: "05:30",
    route: "Addis Ababa → Bahir Dar",
    status: "Completed",
    date: "February 12, 2025",
    driverName: "Abebe Kebede",
    busNumber: "AA-12345",
    passengerCount: 42,
    terminalName: "Addis Ababa Central Terminal"
  };

  const handleBackClick = () => {
    navigate("/manage-travels");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ongoing":
        return "bg-green-500";
      case "Upcoming":
        return "bg-blue-500";
      case "Completed":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "Ongoing":
        return "text-green-500";
      case "Upcoming":
        return "text-blue-500";
      case "Completed":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <DashboardLayout showHeader={false}>
      <div className="flex flex-col">
        <div className="flex flex-col mb-3">
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1" 
              onClick={handleBackClick}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Calendar</span>
            </Button>
            <h1 className="text-[#F35B04] text-base font-bold tracking-[2.4px] uppercase">
              MANAGE TRAVELS - DETAIL VIEW
            </h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{eventData.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-600">{eventData.date}</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-600">{eventData.startTime} - {eventData.endTime}</span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(eventData.status)}`}></div>
                    <span className={`text-sm ${getStatusTextColor(eventData.status)}`}>{eventData.status}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1" 
                onClick={handleBackClick}
              >
                <Calendar className="h-4 w-4" />
                <span>View in Calendar</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Trip Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Trip ID:</span>
                    <span className="text-sm font-medium">{eventData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Route:</span>
                    <span className="text-sm font-medium">{eventData.route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Terminal:</span>
                    <span className="text-sm font-medium">{eventData.terminalName}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Vehicle & Driver</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Driver Name:</span>
                    <span className="text-sm font-medium">{eventData.driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bus Number:</span>
                    <span className="text-sm font-medium">{eventData.busNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Passengers:</span>
                    <span className="text-sm font-medium">{eventData.passengerCount}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
              <p className="text-sm text-gray-600">
                Regular scheduled trip. No special instructions.
              </p>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline">Edit Trip</Button>
              <Button>Print Details</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageTravelsTaskView;
