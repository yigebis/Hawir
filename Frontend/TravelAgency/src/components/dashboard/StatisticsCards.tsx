import React from "react";

interface StatisticCardProps {
  value: string | number; // value can now be string or number
  label: string;
  color: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  value,
  label,
  color,
}) => {
  const getTextColorClass = (color: string) => {
    switch (color) {
      case 'red-600':
        return 'text-red-600';
      case 'green-700':
        return 'text-green-700';
      case 'yellow-500':
        return 'text-yellow-500';
      case 'orange-500':
        return 'text-orange-500';
      default:
        return 'text-gray-700';
    }
  };

  const textColorClass = getTextColorClass(color);

  return (
    <div className="bg-white shadow-sm rounded-lg p-5 flex-1 border border-gray-200">
      <div className={`${textColorClass} text-2xl font-bold`}>{value}</div>
      <div className={`${textColorClass} text-sm font-medium mt-1`}>{label}</div>
    </div>
  );
};

// --- NEW PROPS FOR STATISTICS CARDS ---
interface StatisticsCardsProps {
  totalCustomers: string; // Keeping this as string for now if not dynamic
  activeTravels: number;
  totalDestinations: number;
  canceledTravels: number;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  totalCustomers,
  activeTravels,
  totalDestinations,
  canceledTravels,
}) => {
  return (
    <section className="w-full">
      <div
        className="relative bg-cover bg-center rounded-lg overflow-hidden py-10"
        style={{
          backgroundImage: "url('/Bgimg.png')", // Use absolute path from public
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 backdrop-blur-md bg-white/50"></div>
        <div className="relative z-10 text-center px-4 mb-6">
          <h2 className="text-2xl font-bold text-black">Manage your travels with ease</h2>
          <p className="text-sm text-black text-opacity-90 mt-2">Discover new destination with Hawir</p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-4 px-6">
          <StatisticCard
            value={totalCustomers} // Dynamic, but still hardcoded from Index.tsx
            label="Total Customer"
            color="red-600"
          />
          <StatisticCard
            value={activeTravels} // Dynamic
            label="Active Travel"
            color="green-700"
          />
          <StatisticCard
            value={totalDestinations} // Dynamic
            label="Unique Destinations" // Changed label slightly for clarity
            color="yellow-500"
          />
          <StatisticCard
            value={canceledTravels} // Dynamic
            label="Canceled Travels"
            color="orange-500"
          />
        </div>
      </div>
    </section>
  );
};

export default StatisticsCards;
