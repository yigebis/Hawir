
import React, { useState } from "react";
import TravelItem from "./TravelItem";
import AddTripModal from "../trips/AddTripModal";

const ActivityList: React.FC = () => {
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  
  const travelItems = [
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
  ];

  return (
    <section className="mt-[22px]">
      <div className="flex w-full items-stretch gap-[40px_100px] flex-wrap max-md:max-w-full max-md:mr-1">
        <h2 className="text-black text-base font-bold my-auto">
          Recent Activity
        </h2>
        <button 
          onClick={() => setShowAddTripModal(true)}
          className="bg-[rgba(55,144,27,1)] flex items-center gap-0.5 text-sm text-white font-medium text-center flex-1 px-4 py-2 rounded-[10px]"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets/091e50b0e3084a89a54855377607a220/1ef417b1885764fdf7be0c1259bd277215ce282409cf9e2a4d66c6e854eda578?placeholderIfAbsent=true"
            alt="Add Icon"
            className="aspect-[1] object-contain w-4 shrink-0 my-auto"
          />
          <span>Add New</span>
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
      />
    </section>
  );
};

export default ActivityList;
