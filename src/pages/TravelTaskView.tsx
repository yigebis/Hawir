
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, MessagesSquare, Flag, Clock, Route } from "lucide-react";
import { Button } from "@/components/ui/button";

const TravelTaskView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  const handleBack = () => {
    navigate("/manage-travels");
  };

  return (
    <DashboardLayout showHeader={false}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Travel Details</h1>
          </div>
          <Button variant="ghost">View Passengers</Button>
        </div>

        {/* Content */}
        <div className="p-6 bg-white flex-1">
          <div className="max-w-3xl">
            <div className="space-y-6">
              {/* Task Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  {event?.title || "Bahir Dar → Gondar"}
                </h2>
                <div className="flex gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">In Progress</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Schedule</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{event?.start ? event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "07:00"} - {event?.end ? event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "08:30"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Distance</p>
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-gray-500" />
                      <span>180 KM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Updates Section */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-2">
                  <MessagesSquare className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">Updates</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Departure confirmed</p>
                        <p className="text-sm text-gray-500">Bus departed from Bahir Dar station</p>
                      </div>
                      <span className="text-sm text-gray-500">07:00 AM</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Checkpoint reached</p>
                        <p className="text-sm text-gray-500">Passed through Addis Zemen checkpoint</p>
                      </div>
                      <span className="text-sm text-gray-500">07:45 AM</span>
                    </div>
                  </div>
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
