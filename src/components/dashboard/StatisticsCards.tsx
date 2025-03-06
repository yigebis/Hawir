import React from "react";

interface StatisticCardProps {
  value: string;
  label: string;
  color: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  value,
  label,
  color,
}) => {
  return (
    <div
      className={`bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] flex flex-col text-${color} flex-1 pl-4 pr-[45px] py-[17px] rounded-[5px] max-md:pr-5`}
    >
      <div className="text-xl font-bold">{value}</div>
      <div className="text-sm mt-1.5 font-bold">{label}</div>
    </div>
  );
};

const StatisticsCards: React.FC = () => {
  return (
    <section className="flex flex-col relative min-h-[245px] w-full items-center font-bold mt-[33px] px-8 py-[37px] rounded-[10px] max-md:max-w-full max-md:px-5">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/091e50b0e3084a89a54855377607a220/da2f0516522170bc2f0de6394bf054693b327b5ec962da599232f6f327280dae?placeholderIfAbsent=true"
        alt="Background"
        className="absolute h-full w-full object-cover inset-0 rounded-[10px]"
      />
      <div className="relative text-black text-xl text-center">
        Manage your travels with ease
      </div>
      <div className="relative text-black text-[13px] font-medium text-center mt-2">
        Discover new destination with Hawir
      </div>
      <div className="relative self-stretch flex items-stretch gap-[23px] flex-wrap mt-6 max-md:max-w-full">
        <StatisticCard
          value="10,234"
          label="Total Customer"
          color="[rgba(255,0,0,1)]"
        />
        <StatisticCard
          value="842"
          label="Active Travel"
          color="[rgba(50,116,30,1)]"
        />
        <StatisticCard
          value="67"
          label="Destination"
          color="[rgba(241,184,18,1)]"
        />
        <StatisticCard
          value="8"
          label="Canceled Travels"
          color="[rgba(255,119,0,1)]"
        />
      </div>
    </section>
  );
};

export default StatisticsCards;
