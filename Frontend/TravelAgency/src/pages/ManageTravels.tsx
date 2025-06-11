
// src/pages/manage-travels/index.tsx (or wherever your ManageTravels component lives)

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TravelCalendar, { CalendarViewMode } from "@/components/travels/TravelCalendar";
import AddTripModal from "@/components/trips/AddTripModal";
import { ChevronLeft, ChevronRight, Plus, LayoutGrid, Loader2 } from "lucide-react"; // Removed Search icon
import { format } from "date-fns";
import { TravelEventType } from "@/components/travels/TravelEvent"; // Assuming TravelEvent defines TravelEventType
import { toast } from "@/hooks/use-toast";

// !!! IMPORTANT: You need to implement this function !!!
// This function should make an API call to your backend to get all trips.
// It should return a Promise that resolves to an array of TravelEventType.
// Example:
// export const getAllTrips = async (): Promise<TravelEventType[]> => {
//   const response = await fetch('/api/trips'); // Adjust your API endpoint
//   if (!response.ok) {
//     throw new Error('Failed to fetch trips');
//   }
//   const data = await response.json();
//   // You might need to transform data from your backend format to TravelEventType
//   return data.trips;
// };
import { fetchTravels } from "@/lib/api/travelService"; // Adjust this path if necessary
import { useAuth } from "@/contexts/AuthContext";

const ManageTravels: React.FC = () => {
  const { t } = useTranslation();
  const { agency } = useAuth();

  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date?: Date;
    time?: string;
    editEvent?: TravelEventType;
  }>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");
  const [isEditMode, setIsEditMode] = useState(false);

  // --- NEW STATES FOR FETCHING AND MANAGING TRAVEL EVENTS ---
  const [travelEvents, setTravelEvents] = useState<TravelEventType[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState<string | null>(null);

  const fetchTravelEvents = useCallback(async () => {
    console.log("\n\tLog1: fetchTravelEvents called. Agency ID:", agency?.unique_id); // Log 1

    setLoadingEvents(true);
    setErrorEvents(null); // Clear previous errors
    try {
      const fetchedTrips: TravelEventType[] = await fetchTravels(agency.unique_id);
      console.log("\n\tLOG2: Fetched trips data:", fetchedTrips); // Log 2: See what the API returns
      setTravelEvents(fetchedTrips);
    } catch (error: any) {
      console.error("Failed to fetch travel events:", error);
      setErrorEvents(error.message || "Failed to load travel events.");
      toast({
        title: "Error loading trips",
        description: error.message || "Could not fetch the list of trips.",
        variant: "destructive",
      });
      setTravelEvents([]); // Clear events on error to prevent displaying stale data
    } finally {
      setLoadingEvents(false);
    }
  }, []); // Empty dependency array because getAllTrips is typically stable

  useEffect(() => {
    fetchTravelEvents();
  }, [fetchTravelEvents]); // fetchTravelEvents is in dependencies due to useCallback

  useEffect(() => {
    console.log("\n\tLOG3: ManageTravels: travelEvents state updated:", travelEvents); // Log 3: See if state changes
  }, [travelEvents]);

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const handlePreviousDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  const handleAddTrip = (dateTime?: {
    date?: Date;
    time?: string;
    editEvent?: TravelEventType;
  }) => {
    if (dateTime) {
      setSelectedDateTime(dateTime);
      setIsEditMode(!!dateTime.editEvent);
    } else {
      setSelectedDateTime({ date: currentDate });
      setIsEditMode(false);
    }
    setShowAddTripModal(true);
  };

  const handleCloseModal = () => {
    setShowAddTripModal(false);
    setIsEditMode(false);
    setSelectedDateTime({});
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "yearly" ? "day" : "yearly");
  };

  const handleSaveTrip = (tripData: any) => {
    setShowAddTripModal(false); // Close the modal first

    if (tripData.deleted) {
      toast({
        title: "Trip deleted",
        description: "The trip has been removed from the calendar.",
      });
    } else {
      toast({
        title: isEditMode ? "Trip updated" : "Trip added",
        description: isEditMode
          ? "Your changes have been saved to the calendar."
          : "Your new trip has been added to the calendar.",
      });
    }

    console.log("\n\t LOG4: handleSaveTrip completed, now calling fetchTravelEvents."); // Log 4
    fetchTravelEvents(); // This should trigger the re-fetch
  };

  return (
    <DashboardLayout showHeader={false}>
      <div className="flex flex-col">
        <div className="flex flex-col mb-6">
          <h1 className="text-[#F35B04] text-base font-bold tracking-[2.4px] uppercase mb-6">
            {t('manageTravels.title')}
          </h1>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* Only show day navigation if not in yearly mode */}
              {viewMode !== "yearly" && (
                <div className="flex items-center space-x-4">
                  <button
                    className="p-1 rounded-full hover:bg-gray-100"
                    onClick={handlePreviousDay}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-base font-medium">
                    {/* Displays current date based on day/month/year format */}
                    {format(currentDate, "EEE dd MMMM, yyyy")}
                  </span>
                  <button
                    className="p-1 rounded-full hover:bg-gray-100"
                    onClick={handleNextDay}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-6">
              {/* Legend for trip statuses */}
              <div className="flex space-x-5">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-500">{t('manageTravels.ongoing')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-500">{t('manageTravels.upcoming')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-xs text-gray-500">{t('manageTravels.completed')}</span>
                </div>
              </div>

              {/* Action buttons: Toggle View, Add Trip (removed search) */}
              <div className="flex items-center space-x-4">
                <button
                  className="text-green-800 focus:outline-none"
                  onClick={toggleViewMode}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  className="text-green-800 focus:outline-none"
                  onClick={() => handleAddTrip()} // No specific date/time for general "Add Trip"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- TravelCalendar Component --- */}
        {/* Pass the fetched events and their loading/error states to TravelCalendar */}
        <TravelCalendar
          onAddTrip={handleAddTrip}
          selectedDate={currentDate}
          onDateChange={setCurrentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          events={travelEvents} // <--- Pass the fetched events here
          loadingEvents={loadingEvents} // <--- Pass the loading state
          errorEvents={errorEvents} // <--- Pass the error state
        />

        {/* --- AddTripModal Component --- */}
        <AddTripModal
          isOpen={showAddTripModal}
          onClose={handleCloseModal}
          initialDate={selectedDateTime.date}
          initialTime={selectedDateTime.time}
          editMode={isEditMode}
          tripToEdit={selectedDateTime.editEvent}
          onSave={handleSaveTrip}
        />
      </div>
    </DashboardLayout>
  );
};

export default ManageTravels;
