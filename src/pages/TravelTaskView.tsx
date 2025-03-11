
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ChevronLeft } from "lucide-react";
import { TravelEventType } from "@/components/travels/TravelEvent";
import { format } from "date-fns";

interface LocationState {
  event?: TravelEventType;
}

const TravelTaskView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { event } = (location.state as LocationState) || {};
  
  const handleBackClick = () => {
    navigate("/manage-travels");
  };

  // If no event is provided, show a message
  if (!event) {
    return (
      <DashboardLayout showHeader={false}>
        <div className="flex flex-col">
          <div className="flex flex-col mb-3">
            <h1 className="text-[#F35B04] text-base font-bold tracking-[2.4px] uppercase mb-6">
              MANAGE TRAVELS - TASK VIEW
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={handleBackClick} 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Calendar</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No travel selected. Please go back and select a travel.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Determine status color class based on event color
  const getStatusColorClass = () => {
    switch(event.color) {
      case 'blue':
        return 'text-blue-500';
      case 'green':
        return 'text-green-500';
      case 'orange':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch(event.color) {
      case 'blue':
        return 'Upcoming';
      case 'green':
        return 'Ongoing';
      case 'orange':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  // Format the date display
  const formatEventDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy");
  };

  return (
    <DashboardLayout showHeader={false}>
      <div className="flex flex-col">
        <div className="flex flex-col mb-3">
          <h1 className="text-[#F35B04] text-base font-bold tracking-[2.4px] uppercase mb-6">
            MANAGE TRAVELS - TASK VIEW
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={handleBackClick} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Calendar</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-gray-500">{formatEventDate(event.start)}</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Time</h3>
                <p>{format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                <p className={getStatusColorClass()}>{getStatusText()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Bus Number</h3>
                <p>ETH-{Math.floor(1000 + Math.random() * 9000)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Driver</h3>
                <p>Samuel Bekele</p>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Passengers</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Total: 45 passengers</p>
                  <div className="h-2 bg-gray-200 rounded-full mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-gray-600">Regular scheduled trip. No special requirements.</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Tasks</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input type="checkbox" checked className="mr-3" readOnly />
                  <span className="text-gray-600">Pre-trip vehicle inspection</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked className="mr-3" readOnly />
                  <span className="text-gray-600">Passenger check-in</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span className="text-gray-600">Luggage loading</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span className="text-gray-600">Final passenger count</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span className="text-gray-600">Trip completion report</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TravelTaskView;
