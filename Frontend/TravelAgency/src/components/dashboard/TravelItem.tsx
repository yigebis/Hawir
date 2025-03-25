
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
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between">
        <div>
          <h4 className="font-bold text-lg text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">Departure: {departureDate}</p>
          <p className="text-xs text-gray-500 mt-1">ID:{id}</p>
        </div>
        <div className="self-center">
          <p className="text-sm font-medium">Price: {price}</p>
        </div>
      </div>
    </div>
  );
};

export default TravelItem;
