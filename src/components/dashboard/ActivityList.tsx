
import React, { useState } from "react";
import TravelItem from "./TravelItem";
import AddTripModal from "../trips/AddTripModal";
import { Plus } from "lucide-react";

const ActivityList: React.FC = () => {
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [travelItems, setTravelItems] = useState([
    {
      title: "Hawassa Trip",
      departureDate: "2024-03-15",
      id: "TR928",
      price: "1500 Birr",
    },
    {
      title: "Gondar Trip",
      departureDate: "2024-03-16",
      id: "TR929",
      price: "2200 Birr",
    },
  ]);

  const handleSaveTrip = (tripData: any) => {
    setShowAddTripModal(false);
    
    // Create a new travel item from the trip data
    const newItem = {
      title: `${tripData.departureCity} → ${tripData.arrivalCity}`,
      departureDate: tripData.departureDate.toISOString().split('T')[0],
      id: `TR${Math.floor(Math.random() * 1000)}`,
      price: `${tripData.price} Birr`,
    };
    
    // Add to travel items
    setTravelItems(prev => [...prev, newItem]);
  };

  return (
    <section className="mt-[22px]">
      <div className="flex w-full items-center justify-between gap-[40px] max-md:max-w-full max-md:mr-1">
        <h2 className="text-black text-base font-bold">
          Recent Activity
        </h2>
        <button 
          onClick={() => setShowAddTripModal(true)}
          className="bg-[rgba(55,144,27,1)] flex items-center gap-1 text-sm text-white font-medium px-4 py-2 rounded-[10px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Trip</span>
        </button>
      </div>

      <div className="mt-4">
        {travelItems.map((item, index) => (
          <TravelItem
            key={index}
            title={item.title}
            departureDate={item.departureDate}
            id={item.id}
            price={item.price}
          />
        ))}
      </div>
      
      <AddTripModal 
        isOpen={showAddTripModal} 
        onClose={() => setShowAddTripModal(false)} 
        onSave={handleSaveTrip}
      />
    </section>
  );
};

export default ActivityList;
