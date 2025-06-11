
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Star, Coins, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { fetchAgencyRating } from "@/lib/api/travelService";
import { useAuth } from "@/contexts/AuthContext";

export interface AgencyRating {
  id?: string;
  agency_id: string;
  rating: number;
  total_rating_sum: number;
  total_rating_count: number;
}

interface ReportStatsCardsProps {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number; // This prop still exists but won't be displayed
  averageRating: number;
  totalRevenue: number;
  revenueGrowth?: number;
}

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {trend && (
              <div className={`flex items-center mt-2 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')} ${color.replace('text-', 'text-')}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ReportStatsCards: React.FC<ReportStatsCardsProps> = ({
  totalCustomers,
  activeCustomers,
  newCustomers, // Received but not used
  averageRating,
  totalRevenue,
  revenueGrowth = 12.5
}) => {
  const { agency } = useAuth();
  const agencyId = agency?.unique_id;

  const [agencyOverallRating, setAgencyOverallRating] = useState<number | null>(null);
  const [loadingAgencyRating, setLoadingAgencyRating] = useState(true);
  const [errorAgencyRating, setErrorAgencyRating] = useState<string | null>(null);

  useEffect(() => {
    const getAgencyRating = async () => {
      if (!agencyId) {
        console.warn("ReportStatsCards: Agency ID not available. Skipping agency rating fetch.");
        setLoadingAgencyRating(false);
        setErrorAgencyRating("Agency ID not available to fetch rating.");
        setAgencyOverallRating(null);
        return;
      }

      setLoadingAgencyRating(true);
      setErrorAgencyRating(null);
      try {
        const ratingData = await fetchAgencyRating(agencyId);
        console.log("At Reports page displaying agency rating:", ratingData);

        if (ratingData && typeof ratingData.rating === 'number') {
          setAgencyOverallRating(ratingData.rating);
        } else {
          setAgencyOverallRating(null);
          console.log(`ReportStatsCards: No valid agency rating data found for agencyId: ${agencyId}`);
        }
      } catch (err: any) {
        console.error("ReportStatsCards: Error fetching agency rating:", err);
        setErrorAgencyRating(err.message || "Failed to fetch agency rating.");
        setAgencyOverallRating(null);
      } finally {
        setLoadingAgencyRating(false);
      }
    };

    getAgencyRating();
  }, [agencyId]);

  const formatCurrency = (amount: number) => {
    return `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatRating = (rating: number | null) => {
    if (rating === null || isNaN(rating)) return "N/A";
    return `${rating.toFixed(1)}/5.0`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Customers"
        value={totalCustomers.toLocaleString()}
        icon={<Users size={24} />}
        color="text-blue-600"
      />
      <StatCard
        title="Active Customers"
        value={activeCustomers.toLocaleString()}
        icon={<UserCheck size={24} />}
        color="text-green-600"
      />
      <StatCard
        title="Agency Overall Rating"
        value={
          loadingAgencyRating
            ? <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            : errorAgencyRating
              ? "Error"
              : formatRating(agencyOverallRating)
        }
        icon={<Star size={24} />}
        color="text-yellow-600"
      />
      <StatCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        icon={<Coins size={24} />}
        color="text-[#F35B04]"
        trend={{
          value: revenueGrowth,
          isPositive: revenueGrowth > 0
        }}
      />
    </div>
  );
};

export default ReportStatsCards;
