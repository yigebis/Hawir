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
    <div className="border flex items-stretch gap-5 text-xs text-black flex-wrap justify-between mt-[15px] first:mt-4 px-[17px] py-[18px] rounded-[5px] border-[rgba(50,116,30,1)] border-solid max-md:max-w-full max-md:mr-1">
      <div className="flex flex-col">
        <div className="font-semibold">{title}</div>
        <div className="font-normal self-stretch">
          Departure: {departureDate}
        </div>
        <div className="text-[10px] font-light mt-[7px]">ID:{id}</div>
      </div>
      <div className="font-normal my-auto">Price: {price}</div>
    </div>
  );
};

export default TravelItem;
