
// src/pages/Index.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatisticsCards from "@/components/dashboard/StatisticsCards";
import ActivityList from "@/components/dashboard/ActivityList";
import { Plus, Loader2 } from "lucide-react";
import AddTripModal from "@/components/trips/AddTripModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { fetchTravels } from "@/lib/api/travelService";
import { TravelEventType } from "@/components/travels/TravelEvent";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Index: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { agency, token, user } = useAuth();

  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date?: Date;
    time?: string;
    editEvent?: any;
  }>({});

  // States for Recent Travels
  const [recentTravels, setRecentTravels] = useState<TravelEventType[]>([]);
  const [loadingRecentActivities, setLoadingRecentActivities] = useState(true);
  const [errorRecentActivities, setErrorRecentActivities] = useState<string | null>(null);

  // States for Statistics
  const [totalActiveTravels, setTotalActiveTravels] = useState<number>(0);
  const [totalDestinations, setTotalDestinations] = useState<number>(0);
  const [totalCancelledTravels, setTotalCancelledTravels] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  // Consolidated function to fetch all dashboard-related data
  const fetchDashboardData = useCallback(async () => {
    if (!agency?.unique_id || !token) {
      setLoadingRecentActivities(false);
      setLoadingStats(false);
      setErrorRecentActivities("Authentication or Agency ID not available. Cannot fetch data.");
      setErrorStats("Authentication or Agency ID not available. Cannot fetch stats.");
      setRecentTravels([]);
      setTotalActiveTravels(0);
      setTotalDestinations(0);
      setTotalCancelledTravels(0);
      toast({
        title: "Authentication Error",
        description: "Agency information or token is missing. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setLoadingRecentActivities(true);
    setLoadingStats(true);
    setErrorRecentActivities(null);
    setErrorStats(null);

    try {
      const fetchedData = await fetchTravels(agency.unique_id);

      // --- Process Recent Travels (based on last_mod_time) ---
      const sortedByModTime = fetchedData
        .sort((a, b) => {
          // Assuming last_mod_time exists on TravelEventType and is an ISO string
          const dateA = a.last_mod_time ? new Date(a.last_mod_time) : new Date(0);
          const dateB = b.last_mod_time ? new Date(b.last_mod_time) : new Date(0);
          return dateB.getTime() - dateA.getTime(); // Descending order
        })
        .slice(0, 3); // Get top 3
      setRecentTravels(sortedByModTime);

      // --- Calculate Statistics ---
      const activeCount = fetchedData.filter(travel => travel.status === 'upcoming' || travel.status === "ongoing").length;
      setTotalActiveTravels(activeCount);

      const uniqueDestinations = new Set<string>();
      fetchedData.forEach(travel => {
        if (travel.destination) {
          uniqueDestinations.add(travel.destination);
        }
      });
      setTotalDestinations(uniqueDestinations.size);

      const cancelledCount = fetchedData.filter(travel => travel.status === 'cancelled').length;
      setTotalCancelledTravels(cancelledCount);

    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      const errorMessage = err.message || "Failed to load dashboard information.";
      setErrorRecentActivities(errorMessage);
      setErrorStats(errorMessage);
      setRecentTravels([]);
      setTotalActiveTravels(0);
      setTotalDestinations(0);
      setTotalCancelledTravels(0);
      toast({
        title: "Error loading dashboard data",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingRecentActivities(false);
      setLoadingStats(false);
    }
  }, [agency?.unique_id, token]); // Dependencies for useCallback

  // Effect to fetch all dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAddNewTrip = () => {
    setSelectedDateTime({ date: new Date() });
    setShowAddTripModal(true);
  };

  const handleCloseModal = () => {
    setShowAddTripModal(false);
    setSelectedDateTime({});
  };

  const handleSaveTrip = (tripData: any) => {
    setShowAddTripModal(false);
    // After saving a trip, re-fetch all dashboard data to update both lists
    fetchDashboardData();
    // Optionally, navigate to manage-travels (if that's the desired flow)
    // navigate("/manage-travels");
  };

  // Create Add New button component
  const AddNewButton = (
    <Button
      onClick={handleAddNewTrip}
      className="bg-[#45A049] hover:bg-[#3d8d41] text-white rounded-md px-4 py-2 flex items-center gap-2 shadow-md"
    >
      <Plus size={18} />
      <span>{t('dashboard.addNew')}</span>
    </Button>
  );

  return (
    <DashboardLayout showHeader={true}>
      <div className="flex flex-col gap-8">
        {/* Statistics Cards */}
        {loadingStats ? (
          <div className="flex justify-center items-center h-40 bg-white rounded-lg shadow">
            <Loader2 className="h-8 w-8 animate-spin text-[#F35B04]" />
            <p className="ml-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : errorStats ? (
          <div className="text-center text-red-600 p-4 bg-white rounded-lg shadow">
            <p>{t('common.error')}: {errorStats}</p>
            <p className="mt-2 text-sm text-gray-500">Please try again later.</p>
          </div>
        ) : (
          <StatisticsCards
            totalCustomers="10,234" // <--- Still static, as explained before
            activeTravels={totalActiveTravels}
            totalDestinations={totalDestinations}
            canceledTravels={totalCancelledTravels}
          />
        )}

        {/* Recent Activity List */}
        {loadingRecentActivities ? (
          <div className="flex justify-center items-center h-40 bg-white rounded-lg shadow">
            <Loader2 className="h-8 w-8 animate-spin text-[#F35B04]" />
            <p className="ml-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : errorRecentActivities ? (
          <div className="text-center text-red-600 p-4 bg-white rounded-lg shadow">
            <p>{t('common.error')}: {errorRecentActivities}</p>
            <p className="mt-2 text-sm text-gray-500">Please try again later.</p>
          </div>
        ) : recentTravels.length === 0 ? (
          <ActivityList headerRight={AddNewButton} recentTravels={[]} />
        ) : (
          <ActivityList headerRight={AddNewButton} recentTravels={recentTravels} />
        )}

        {/* Add Trip Modal */}
        <AddTripModal
          isOpen={showAddTripModal}
          onClose={handleCloseModal}
          initialDate={selectedDateTime.date}
          initialTime={selectedDateTime.time}
          onSave={handleSaveTrip}
        />
      </div>
    </DashboardLayout>
  );
};

export default Index;
