
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatisticsCards from "@/components/dashboard/StatisticsCards";
import ActivityList from "@/components/dashboard/ActivityList";
import { Plus } from "lucide-react";
import AddTripModal from "@/components/trips/AddTripModal";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date?: Date;
    time?: string;
    editEvent?: any;
  }>({});

  const handleAddNewTrip = () => {
    setSelectedDateTime({ date: new Date() });
    setShowAddTripModal(true);
  };

  const handleCloseModal = () => {
    setShowAddTripModal(false);
    setSelectedDateTime({});
  };

  const handleSaveTrip = (tripData: any) => {
    setShowAddTripModal(false);
    // Calendar component will refresh its events after the save
    navigate("/manage-travels");
  };

  // Create Add New button component
  const AddNewButton = (
    <Button 
      onClick={handleAddNewTrip}
      className="bg-[#45A049] hover:bg-[#3d8d41] text-white rounded-md px-4 py-2 flex items-center gap-2 shadow-md"
    >
      <Plus size={18} />
      <span>Add New</span>
    </Button>
  );

  return (
    <DashboardLayout showHeader={true}>
      <div className="flex flex-col gap-8">
        <div>
          <StatisticsCards />
        </div>
        
        <ActivityList headerRight={AddNewButton} />
        
        {/* Add Trip Modal */}
        <AddTripModal 
          isOpen={showAddTripModal} 
          onClose={handleCloseModal} 
          initialDate={selectedDateTime.date}
          initialTime={selectedDateTime.time}
          onSave={handleSaveTrip}
        />
      </div>
    </DashboardLayout>
  );
};

export default Index;
