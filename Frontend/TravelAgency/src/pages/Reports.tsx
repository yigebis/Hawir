import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { fetchTravels } from "@/lib/api/travelService";
import { fetchTravelBookings } from "@/lib/api/travelService";
import { useAuth } from "@/contexts/AuthContext";
import ReportStatsCards from "@/components/reports/ReportStatsCards";
import RevenueTrendChart from "@/components/reports/RevenueTrendChart";
import CustomersTrendChart from "@/components/reports/CustomersTrendChart";
import ActivityHeatmap from "@/components/reports/ActivityHeatmap";
import PopularDestinationsTable from "@/components/reports/PopularDestinationsTable";

const Reports = () => {
  const { user } = useAuth();
  const [revenuePeriod, setRevenuePeriod] = useState<'daily' | 'monthly'>('monthly');
  const [revenueYear, setRevenueYear] = useState<string>('2024');
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const [heatmapYear, setHeatmapYear] = useState<string>('2024');
  const [customersPeriod, setCustomersPeriod] = useState<'daily' | 'monthly'>('monthly');
  const [customersYear, setCustomersYear] = useState<string>('2024');
  const [selectedCustomersMonth, setSelectedCustomersMonth] = useState<string | undefined>(undefined);

  // Fetch travels data
  const { data: travels = [], isLoading: travelsLoading } = useQuery({
    queryKey: ['travels', user?.agencyId],
    queryFn: () => fetchTravels(user?.agencyId || ''),
    enabled: !!user?.agencyId,
  });

  // Mock data for demonstration
  const mockCustomersData = {
    totalCustomers: 1250,
    activeCustomers: 185,
    newCustomers: 47,
    averageRating: 4.6,
    revenueGrowth: 12.5
  };

  // Generate revenue data with drill-down capability
  const generateRevenueData = (period: 'daily' | 'monthly', year: string, month?: string) => {
    const baseRevenue = year === '2024' ? 1.2 : year === '2025' ? 1.5 : 1.0;
    
    if (period === 'daily' && month) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.indexOf(month);
      
      if (monthIndex === -1) {
        // Fallback if month name not found
        return [];
      }
      
      const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();
      
      return Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(parseInt(year), monthIndex, i + 1);
        const dayOfWeek = date.getDay();
        // Add some variation based on day of week (weekends might be lower)
        const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1;
        
        return {
          period: `${month.slice(0, 3)} ${i + 1}`,
          revenue: Math.floor((15000 + Math.random() * 10000) * baseRevenue * weekendMultiplier),
          fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      });
    } else if (period === 'monthly') {
      return [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ].map((month, i) => ({
        period: month,
        revenue: Math.floor((450000 + Math.random() * 200000) * baseRevenue),
        fullDate: `${month} ${year}`,
        monthIndex: i
      }));
    } else {
      // Default daily for current month when no specific month is selected
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const daysInMonth = new Date(parseInt(year), currentMonth + 1, 0).getDate();
      
      return Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(parseInt(year), currentMonth, i + 1);
        return {
          period: `${date.toLocaleDateString('en-US', { month: 'short' })} ${i + 1}`,
          revenue: Math.floor((15000 + Math.random() * 10000) * baseRevenue),
          fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      });
    }
  };

  // Generate customers data with drill-down capability
  const generateCustomersData = (period: 'daily' | 'monthly', year: string, month?: string) => {
    const baseCustomers = year === '2024' ? 1.2 : year === '2025' ? 1.5 : 1.0;
    
    if (period === 'daily' && month) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.indexOf(month);
      
      if (monthIndex === -1) {
        return [];
      }
      
      const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();
      
      return Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(parseInt(year), monthIndex, i + 1);
        const dayOfWeek = date.getDay();
        const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.8 : 1;
        
        return {
          period: `${month.slice(0, 3)} ${i + 1}`,
          customers: Math.floor((5 + Math.random() * 15) * baseCustomers * weekendMultiplier),
          fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      });
    } else if (period === 'monthly') {
      return [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ].map((month, i) => ({
        period: month,
        customers: Math.floor((25 + Math.random() * 50) * baseCustomers),
        fullDate: `${month} ${year}`,
        monthIndex: i
      }));
    } else {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const daysInMonth = new Date(parseInt(year), currentMonth + 1, 0).getDate();
      
      return Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(parseInt(year), currentMonth, i + 1);
        return {
          period: `${date.toLocaleDateString('en-US', { month: 'short' })} ${i + 1}`,
          customers: Math.floor((5 + Math.random() * 15) * baseCustomers),
          fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      });
    }
  };

  // Generate heatmap data in GitHub style
  const generateHeatmapData = (year: string, type: 'trips' | 'bookings') => {
    const data = [];
    const yearMultiplier = year === '2024' ? 1.2 : year === '2025' ? 1.5 : 1.0;
    const baseValue = type === 'trips' ? 5 : 15;
    
    // Generate data for entire year
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(parseInt(year), month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(parseInt(year), month, day);
        const dayOfWeek = date.getDay(); // 0 = Sunday
        const week = Math.floor((date.getTime() - new Date(parseInt(year), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        data.push({
          date: date,
          value: Math.max(0, Math.floor((baseValue + Math.random() * baseValue) * yearMultiplier)),
          dayOfWeek: dayOfWeek,
          week: week
        });
      }
    }
    
    return data;
  };

  const revenueData = generateRevenueData(revenuePeriod, revenueYear, selectedMonth);
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

  const customersData = generateCustomersData(customersPeriod, customersYear, selectedCustomersMonth);

  const tripsHeatmapData = generateHeatmapData(heatmapYear, 'trips');
  const bookingsHeatmapData = generateHeatmapData(heatmapYear, 'bookings');

  // Handle month selection for revenue drill-down
  const handleMonthSelect = (month: string) => {
    console.log(`Month selected: ${month}`);
    setSelectedMonth(month);
    setRevenuePeriod('daily');
  };

  const handleBackToMonthly = () => {
    console.log('Back to monthly view');
    setSelectedMonth(undefined);
    setRevenuePeriod('monthly');
  };

  // Handle month selection for customers drill-down
  const handleCustomersMonthSelect = (month: string) => {
    console.log(`Customers month selected: ${month}`);
    setSelectedCustomersMonth(month);
    setCustomersPeriod('daily');
  };

  const handleCustomersBackToMonthly = () => {
    console.log('Back to customers monthly view');
    setSelectedCustomersMonth(undefined);
    setCustomersPeriod('monthly');
  };

  // Handle period change
  const handleRevenuePeriodChange = (period: 'daily' | 'monthly') => {
    if (period === 'monthly') {
      setSelectedMonth(undefined);
    }
    setRevenuePeriod(period);
  };

  const handleCustomersPeriodChange = (period: 'daily' | 'monthly') => {
    if (period === 'monthly') {
      setSelectedCustomersMonth(undefined);
    }
    setCustomersPeriod(period);
  };

  // Mock popular destinations data
  const popularDestinations = [
    { destination: "Addis Ababa", totalTravelers: 892 },
    { destination: "Dire Dawa", totalTravelers: 654 },
    { destination: "Bahir Dar", totalTravelers: 543 },
    { destination: "Mekelle", totalTravelers: 432 },
    { destination: "Jimma", totalTravelers: 321 }
  ];

  if (travelsLoading) {
    return (
      <DashboardLayout showHeader={false}>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading reports...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout showHeader={false}>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-[#F35B04] text-base font-bold tracking-[2.4px] uppercase">
            REPORTS & ANALYTICS
          </h1>
        </div>

        {/* Statistics Cards */}
        <ReportStatsCards 
          totalCustomers={mockCustomersData.totalCustomers}
          activeCustomers={mockCustomersData.activeCustomers}
          newCustomers={mockCustomersData.newCustomers}
          averageRating={mockCustomersData.averageRating}
          totalRevenue={totalRevenue}
          revenueGrowth={mockCustomersData.revenueGrowth}
        />

        {/* Revenue Trend Chart */}
        <RevenueTrendChart 
          data={revenueData}
          period={revenuePeriod}
          year={revenueYear}
          selectedMonth={selectedMonth}
          onPeriodChange={handleRevenuePeriodChange}
          onYearChange={setRevenueYear}
          onMonthSelect={handleMonthSelect}
          onBackToMonthly={handleBackToMonthly}
        />

        {/* New Customers Trend Chart */}
        <CustomersTrendChart 
          data={customersData}
          period={customersPeriod}
          year={customersYear}
          selectedMonth={selectedCustomersMonth}
          onPeriodChange={handleCustomersPeriodChange}
          onYearChange={setCustomersYear}
          onMonthSelect={handleCustomersMonthSelect}
          onBackToMonthly={handleCustomersBackToMonthly}
        />

        {/* Activity Heatmap and Popular Destinations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityHeatmap 
              tripsData={tripsHeatmapData}
              bookingsData={bookingsHeatmapData}
              year={heatmapYear}
              onYearChange={setHeatmapYear}
            />
          </div>
          <div className="lg:col-span-1">
            <PopularDestinationsTable destinations={popularDestinations} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
