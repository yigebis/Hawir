
import React from "react";

interface TravelItemProps {
  title: string;
  departureDate: string;
  id: string;
  price: string;
}

const TravelItem: React.FC<TravelItemProps> = ({
  title,
  departureDate,
  id,
  price,
}) => {
  return (
    <div className="border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <div>
          <h4 className="font-bold text-sm">{title}</h4>
          <p className="text-sm mt-1">Departure: {departureDate}</p>
          <p className="text-xs text-gray-500 mt-2">ID:{id}</p>
        </div>
        <div className="self-center">
          <p className="text-sm">Price: {price}</p>
        </div>
      </div>
    </div>
  );
};

export default TravelItem;
