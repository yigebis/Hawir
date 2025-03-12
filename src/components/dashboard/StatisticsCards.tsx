
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
    <div className="bg-white shadow-sm rounded-lg p-5 flex-1">
      <div className={`text-${color} text-2xl font-bold`}>{value}</div>
      <div className={`text-${color} text-sm font-medium mt-1`}>{label}</div>
    </div>
  );
};

const StatisticsCards: React.FC = () => {
  return (
    <section className="w-full">
      <div className="relative bg-cover bg-center rounded-lg overflow-hidden py-10" 
           style={{ backgroundImage: `url('/lovable-uploads/4c4213de-f24a-40c1-b7fe-7b45878a2969.png')` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.7)] to-[rgba(255,255,255,0.4)]"></div>
        <div className="relative z-10 text-center px-4 mb-6">
          <h2 className="text-2xl font-bold text-black">Manage your travels with ease</h2>
          <p className="text-sm text-black mt-2">Discover new destination with Hawir</p>
        </div>
        
        <div className="relative z-10 flex flex-wrap gap-4 px-6">
          <StatisticCard
            value="10,234"
            label="Total Customer"
            color="red-600"
          />
          <StatisticCard
            value="842"
            label="Active Travel"
            color="green-700"
          />
          <StatisticCard
            value="67"
            label="Destination"
            color="yellow-500"
          />
          <StatisticCard
            value="8"
            label="Canceled Travels"
            color="orange-500"
          />
        </div>
      </div>
    </section>
  );
};

export default StatisticsCards;
