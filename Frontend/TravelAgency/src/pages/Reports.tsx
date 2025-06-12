import React, { useState, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import {
  fetchTravels,
  fetchBookingHeatmap,
  fetchTripHeatmap,
  fetchRevenueReport,
  fetchTopFiveDestinations,
  BackendDestination // Use BackendDestination if that's what your Go backend is sending.
  // If you implemented TopDestinationReportItem in Go, you should import that here instead.
} from "@/lib/api/travelService";
import { useAuth } from "@/contexts/AuthContext";
import ReportStatsCards from "@/components/reports/ReportStatsCards";
import RevenueTrendChart from "@/components/reports/RevenueTrendChart";
import CustomersTrendChart from "@/components/reports/CustomersTrendChart";
import ActivityHeatmap from "@/components/reports/ActivityHeatmap";
import PopularDestinationsTable from "@/components/reports/PopularDestinationsTable"; // Corrected import path


const Reports = () => {
  const { user, token } = useAuth();
  const [revenuePeriod, setRevenuePeriod] = useState<'daily' | 'monthly'>('monthly');
  const [revenueYear, setRevenueYear] = useState<string>('2025');
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const [heatmapYear, setHeatmapYear] = useState<string>('2025');
  const [customersPeriod, setCustomersPeriod] = useState<'daily' | 'monthly'>('monthly');
  const [customersYear, setCustomersYear] = useState<string>('2024');
  const [selectedCustomersMonth, setSelectedCustomersMonth] = useState<string | undefined>(undefined);

  // Fetch travels data (assuming this is used elsewhere)
  const { data: travels = [], isLoading: travelsLoading } = useQuery({
    queryKey: ['travels', user?.agencyId],
    queryFn: () => fetchTravels(user?.agencyId || ''),
    enabled: !!user?.agencyId,
  });

  // Fetch booking heatmap data
  const { data: bookHeatmapData = [], isLoading: bookHeatmapLoading, error: bookHeatmapError } = useQuery<number[], Error>({
    queryKey: ['bookingHeatmap', user?.agencyId, token],
    queryFn: () => fetchBookingHeatmap(user?.agencyId || '', token || ''),
    enabled: !!user?.agencyId && !!token,
  });

  // Fetch trip heatmap data
  const { data: tripHeatmapData = [], isLoading: tripHeatmapLoading, error: tripHeatmapError } = useQuery<number[], Error>({
    queryKey: ['tripHeatmap', user?.agencyId, token],
    queryFn: () => fetchTripHeatmap(user?.agencyId || '', token || ''),
    enabled: !!user?.agencyId && !!token,
  });

  // Fetch revenue report data
  const { data: revenueReportRawData = [], isLoading: revenueReportLoading, error: revenueReportError } = useQuery<number[], Error>({
    queryKey: ['revenueReport', user?.agencyId, token],
    queryFn: () => fetchRevenueReport(user?.agencyId || '', token || ''),
    enabled: !!user?.agencyId && !!token,
  });

  // Fetch top five destinations data
  const { data: topFiveDestinationsRaw = [], isLoading: topFiveDestinationsLoading, error: topFiveDestinationsError } = useQuery<BackendDestination[], Error>({ // Ensure BackendDestination or TopDestinationReportItem is correct here
    queryKey: ['topFiveDestinations', user?.agencyId, token],
    queryFn: () => fetchTopFiveDestinations(user?.agencyId || '', token || ''),
    enabled: !!user?.agencyId && !!token,
  });


  // Mock data for demonstration (used for Customers only for now)
  const mockCustomersData = {
    totalCustomers: 1250,
    activeCustomers: 185,
    newCustomers: 47,
    averageRating: 4.6,
    revenueGrowth: 12.5
  };

  // Refactored generateRevenueData to use backend data
  const generateRevenueData = useCallback((
    period: 'daily' | 'monthly',
    year: string,
    month: string | undefined, // Explicitly define type for 'month'
    rawData: number[] = [] // Explicitly define type for 'rawData'
  ) => {
    const data: { period: string; revenue: number; fullDate?: string; monthIndex?: number }[] = [];
    const currentYear = parseInt(year);
    const startDateOfYear = new Date(currentYear, 0, 1);

    if (rawData.length === 0) {
      const baseRevenue = year === '2024' ? 1.2 : year === '2025' ? 1.5 : 1.0;
      if (period === 'daily' && month) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = monthNames.indexOf(month);
        if (monthIndex === -1) return [];
        const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(currentYear, monthIndex, i + 1);
          const dayOfWeek = date.getDay();
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
        ].map((mth, i) => ({
          period: mth,
          revenue: Math.floor((450000 + Math.random() * 200000) * baseRevenue),
          fullDate: `${mth} ${year}`,
          monthIndex: i
        }));
      } else {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(currentYear, currentMonth, i + 1);
          return {
            period: `${date.toLocaleDateString('en-US', { month: 'short' })} ${i + 1}`,
            revenue: Math.floor((15000 + Math.random() * 10000) * baseRevenue),
            fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          };
        });
      }
    }

    const monthNamesLong = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (period === 'monthly') {
      const monthlyRevenue: number[] = Array(12).fill(0);
      let currentDate = new Date(startDateOfYear);
      for (let i = 0; i < rawData.length; i++) {
        if (currentDate.getFullYear() === currentYear) {
          const monthIndex = currentDate.getMonth();
          monthlyRevenue[monthIndex] += rawData[i];
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (let i = 0; i < 12; i++) {
        data.push({
          period: monthNamesShort[i],
          revenue: monthlyRevenue[i],
          fullDate: `${monthNamesLong[i]} ${year}`,
          monthIndex: i
        });
      }
    } else {
      let startDayIndexInRawData = 0;
      let daysToIterate = 0;
      let chartDisplayMonthName = '';
      let chartStartMonthIndex = 0;

      if (month) {
        chartStartMonthIndex = monthNamesLong.indexOf(month);
        if (chartStartMonthIndex === -1) chartStartMonthIndex = 0;

        const monthStart = new Date(currentYear, chartStartMonthIndex, 1);
        startDayIndexInRawData = Math.floor((monthStart.getTime() - startDateOfYear.getTime()) / (24 * 60 * 60 * 1000));

        daysToIterate = new Date(currentYear, chartStartMonthIndex + 1, 0).getDate();
        chartDisplayMonthName = month;
      } else {
        const today = new Date();
        chartStartMonthIndex = today.getMonth();
        const monthStart = new Date(currentYear, chartStartMonthIndex, 1);
        startDayIndexInRawData = Math.floor((monthStart.getTime() - startDateOfYear.getTime()) / (24 * 60 * 60 * 1000));

        daysToIterate = new Date(currentYear, chartStartMonthIndex + 1, 0).getDate();
        chartDisplayMonthName = monthNamesLong[chartStartMonthIndex];
      }

      for (let i = 0; i < daysToIterate; i++) {
        const date = new Date(currentYear, chartStartMonthIndex, i + 1);
        const dataIndex = startDayIndexInRawData + i;
        const revenueValue = dataIndex < rawData.length ? rawData[dataIndex] : 0;
        data.push({
          period: `${chartDisplayMonthName.slice(0, 3)} ${i + 1}`,
          revenue: revenueValue,
          fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
      }
    }
    return data;
  }, [revenuePeriod, revenueYear, selectedMonth, revenueReportRawData]); // ENSURED rawData is correctly named and in dependencies

  // Generate customers data with drill-down capability
  const generateCustomersData = useCallback((period: 'daily' | 'monthly', year: string, month?: string) => {
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
  }, [customersPeriod, customersYear, selectedCustomersMonth]);


  // Generate heatmap data in GitHub style - uses actual data for both trips and bookings
  const generateHeatmapData = useCallback((year: string, type: 'trips' | 'bookings', actualData: number[] = []) => {
    const data = [];
    const currentYear = parseInt(year);
    const startOfYear = new Date(currentYear, 0, 1);

    if (actualData.length > 0) {
      const daysInYear = (new Date(currentYear + 1, 0, 1).getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000);

      for (let dayIndex = 0; dayIndex < daysInYear; dayIndex++) {
        const date = new Date(startOfYear);
        date.setDate(startOfYear.getDate() + dayIndex);

        if (date.getFullYear() !== currentYear) continue;

        const value = actualData[dayIndex] !== undefined ? actualData[dayIndex] : 0;
        const dayOfWeek = date.getDay();
        const week = Math.floor((date.getTime() - startOfYear.getTime() + startOfYear.getDay() * 24 * 60 * 60 * 1000) / (7 * 24 * 60 * 60 * 1000));

        data.push({
          date: date,
          value: value,
          dayOfWeek: dayOfWeek,
          week: week
        });
      }
      return data;
    }

    // Fallback for mock data if no actual data
    const yearMultiplier = year === '2024' ? 1.2 : year === '2025' ? 1.5 : 1.0;
    const baseValue = type === 'trips' ? 5 : 15;

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, month, day);
        const dayOfWeek = date.getDay();
        const week = Math.floor((date.getTime() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

        data.push({
          date: date,
          value: Math.max(0, Math.floor((baseValue + Math.random() * baseValue) * yearMultiplier)),
          dayOfWeek: dayOfWeek,
          week: week
        });
      }
    }

    return data;
  }, [heatmapYear, bookHeatmapData, tripHeatmapData]);


  // Calculate processed data using fetched raw data
  const revenueData = generateRevenueData(revenuePeriod, revenueYear, selectedMonth, revenueReportRawData);
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

  const customersData = generateCustomersData(customersPeriod, customersYear, selectedCustomersMonth);

  const tripsHeatmapData = generateHeatmapData(heatmapYear, 'trips', tripHeatmapData);
  const bookingsHeatmapData = generateHeatmapData(heatmapYear, 'bookings', bookHeatmapData);

  // Process topFiveDestinationsRaw for PopularDestinationsTable
  const popularDestinations = topFiveDestinationsRaw.slice(0, 5).map((dest, index) => ({
    destination: dest.name,
    // If you implemented TopDestinationReportItem in Go, this would be:
    // totalTravelers: dest.totalTravelers 
    totalTravelers: 800 - (index * 100) + Math.floor(Math.random() * 50)
  }));


  // Handle month selection for revenue drill-down
  const handleMonthSelect = useCallback((month: string) => {
    setSelectedMonth(month);
    setRevenuePeriod('daily');
  }, []);

  const handleBackToMonthly = useCallback(() => {
    setSelectedMonth(undefined);
    setRevenuePeriod('monthly');
  }, []);

  // Handle month selection for customers drill-down
  const handleCustomersMonthSelect = useCallback((month: string) => {
    setSelectedCustomersMonth(month);
    setCustomersPeriod('daily');
  }, []);

  const handleCustomersBackToMonthly = useCallback(() => {
    setSelectedCustomersMonth(undefined);
    setCustomersPeriod('monthly');
  }, []);

  // Handle period change
  const handleRevenuePeriodChange = useCallback((period: 'daily' | 'monthly') => {
    if (period === 'monthly') {
      setSelectedMonth(undefined);
    }
    setRevenuePeriod(period);
  }, []);

  const handleCustomersPeriodChange = useCallback((period: 'daily' | 'monthly') => {
    if (period === 'monthly') {
      setSelectedCustomersMonth(undefined);
    }
    setCustomersPeriod(period);
  }, []);

  if (travelsLoading || bookHeatmapLoading || tripHeatmapLoading || revenueReportLoading || topFiveDestinationsLoading) {
    return (
      <DashboardLayout showHeader={false}>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading reports...</div>
          {bookHeatmapLoading && <span className="ml-2">Loading booking heatmap...</span>}
          {tripHeatmapLoading && <span className="ml-2">Loading trip heatmap...</span>}
          {revenueReportLoading && <span className="ml-2">Loading revenue report...</span>}
          {topFiveDestinationsLoading && <span className="ml-2">Loading top destinations...</span>}
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
          selectedCustomersMonth={selectedCustomersMonth} // Pass the new prop
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
