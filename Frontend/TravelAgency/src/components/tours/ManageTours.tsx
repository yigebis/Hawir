// src/components/travels/ManageTours.tsx
import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ToursTable from "@/components/tours/ToursTable"; // Your existing table components
import UpcomingTravelsTable from "@/components/tours/UpcomingTravelsTable";
import OngoingTravelsTable from "@/components/tours/OngoingTravelsTable";
import CompletedTravelsTable from "@/components/tours/CompletedTravelsTable";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchTravels, TravelWithSeats, fetchTravelSeats } from "@/lib/api/travelService"; // Import TravelWithSeats and fetchTravelSeats
import { TravelEventType } from "@/components/travels/TravelEvent"; // Original TravelEventType
import CancelledTravelsTable from "./CancelledTravelsTable";
import { Driver, getDriversByAgencyId } from "@/lib/api/driver"; // Driver API

import BookingModal from '@/components/tours/BookingModal'; // Ensure correct import path

// Define the types for the different tour categories/tabs
type TourCategory = "all" | "upcoming" | "ongoing" | "completed" | "cancelled";

const ManageTours: React.FC = () => {
    const { agency, token } = useAuth(); // Get agency details from AuthContext
    const agencyId = agency?.unique_id;

    // State to keep track of the currently active tab/category
    const [activeCategory, setActiveCategory] = useState<TourCategory>("all");

    // State for fetched travel data - NOW USING TravelWithSeats
    const [allTravels, setAllTravels] = useState<TravelWithSeats[]>([]); // <-- CRITICAL CHANGE HERE
    const [allDrivers, setAllDrivers] = useState<Driver[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Existing states related to BookingModal (untouched)
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedTourForBooking, setSelectedTourForBooking] = useState<TravelEventType | null>(null); // Keep as TravelEventType
    const [fetchedSeatsAvailability, setFetchedSeatsAvailability] = useState<boolean[]>([]);
    const [loadingSeatsForModal, setLoadingSeatsForModal] = useState(false);
    const [errorSeatsForModal, setErrorSeatsForModal] = useState<string | null>(null);


    // Function to fetch all travels from the backend
    const fetchData = useCallback(async () => {
        if (!agencyId) { // Check agencyId here
            setLoading(false);
            setError("Agency ID not available. Cannot fetch travels.");
            setAllTravels([]);
            setAllDrivers([]);
            toast({
                title: "Authentication Error",
                description: "Agency information is missing. Please log in again.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        setError(null); // Clear previous errors
        try {
            // Fetch all travels for the current agency (now returns TravelWithSeats[])
            // And fetch drivers (untouched)
            const [fetchedTravels, fetchedDrivers] = await Promise.all([
                fetchTravels(agencyId), // <-- This now fetches seats as part of TravelWithSeats[]
                getDriversByAgencyId(token) // <-- This remains untouched
            ]);

            console.log("DEBUG-ManageTours: Fetched travels (with seats):", fetchedTravels, "\n");
            console.log("DEBUG-ManageTours: Fetched drivers:", fetchedDrivers, "\n");

            setAllTravels(fetchedTravels || []); // Set state with TravelWithSeats[]
            setAllDrivers(fetchedDrivers || []);
        } catch (err: any) {
            console.error("Failed to fetch all data:", err);
            setError(err.message || "Failed to load travels and drivers.");
            setAllTravels([]);
            setAllDrivers([]);
            toast({
                title: "Error loading travels",
                description: err.message || "Could not fetch the list of travels.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [agencyId, token]); // Re-create if agency ID or token changes

    // Effect to fetch travels on component mount
    useEffect(() => {
        fetchData();
    }, [fetchData]); // Dependency on fetchData (memoized by useCallback)

    // Function to conditionally render the correct table component based on the active category
    const renderTable = () => {
        const currentAllTravels = allTravels || []; // This is TravelWithSeats[]
        const currentAllDrivers = allDrivers || []; // Ensure drivers is also an array

        let filteredTravels: TravelWithSeats[] = []; // <-- CRITICAL: Filtered travels will also be TravelWithSeats[]

        switch (activeCategory) {
            case "all":
                filteredTravels = currentAllTravels;
                break;
            case "upcoming":
                // Original filtering logic, operates on TravelWithSeats[]
                filteredTravels = currentAllTravels.filter(travel => travel.status === 'upcoming');
                break;
            case "ongoing":
                filteredTravels = currentAllTravels.filter(travel => travel.status === 'ongoing');
                break;
            case "completed":
                filteredTravels = currentAllTravels.filter(travel => travel.status === 'completed');
                break;
            case "cancelled":
                filteredTravels = currentAllTravels.filter(travel => travel.status === 'cancelled');
                break;
            default:
                filteredTravels = currentAllTravels;
        }

        console.log(`ManageTours: Rendering ${activeCategory} tab. Filtered travels:`, filteredTravels);

        // IMPORTANT: The 'tours' prop of these table components (`ToursTable`, `UpcomingTravelsTable`, etc.)
        // will now receive `TravelWithSeats[]` which includes `rawSeatsAvailability`.
        // YOU MUST UPDATE THE PROP INTERFACE AND RENDERING LOGIC IN EACH OF THESE TABLE COMPONENTS
        // to display the "Available Slots" column.
        //
        // For each table component (ToursTable, UpcomingTravelsTable, OngoingTravelsTable, CompletedTravelsTable, CancelledTravelsTable):
        // 1. In the file (e.g., `src/components/tours/UpcomingTravelsTable.tsx`):
        //    a. Import `TravelWithSeats` from `src/lib/api/travelService.ts`
        //       `import { TravelWithSeats } from "@/lib/api/travelService";`
        //    b. Update the component's Props interface:
        //       `export interface UpcomingTravelsTableProps { tours: TravelWithSeats[]; drivers: Driver[]; }`
        //       (Change `TravelEventType[]` to `TravelWithSeats[]`)
        //    c. Add a new `<TableHead>` for "Available Slots" in your table's header.
        //    d. Add a new `<TableCell>` in the `map` function that renders each row:
        //       ```jsx
        //       <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        //         {travel.rawSeatsAvailability ? 
        //           `${travel.rawSeatsAvailability.filter(s => !s).length} / ${travel.totalSeats}` : 
        //           <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> // Ensure Loader2 is imported
        //         }
        //       </TableCell>
        //       ```
        //       (Make sure `Loader2` is imported from `lucide-react` in those table files if you use the spinner.)
        //       And also, `drivers` is now `allDrivers` from this file.

        switch (activeCategory) {
            case "all":
                return <ToursTable tours={filteredTravels} drivers={currentAllDrivers} />;
            case "upcoming":
                return <UpcomingTravelsTable tours={filteredTravels} drivers={currentAllDrivers} />;
            case "ongoing":
                return <OngoingTravelsTable tours={filteredTravels} drivers={currentAllDrivers} />;
            case "completed":
                return <CompletedTravelsTable tours={filteredTravels} drivers={currentAllDrivers} />;
            case "cancelled":
                return <CancelledTravelsTable tours={filteredTravels} drivers={currentAllDrivers} />;
            default:
                return <ToursTable tours={filteredTravels} drivers={currentAllDrivers} />;
        }
    };

    // --- Booking Modal related logic --- (Remains untouched from prior iteration)
    const handleOpenBookingModal = useCallback(async (tour: TravelWithSeats) => {
        // Cast to OriginalTravelEventType because BookingModal expects it
        setSelectedTourForBooking(tour as TravelEventType);
        setIsBookingModalOpen(true);
        setLoadingSeatsForModal(true);
        setErrorSeatsForModal(null);

        if (tour.rawSeatsAvailability) {
            setFetchedSeatsAvailability(tour.rawSeatsAvailability);
            console.log("DEBUG-ManageTours: Seats for modal (from pre-fetched data):", tour.rawSeatsAvailability);
            setLoadingSeatsForModal(false);
        } else {
            try {
                console.warn("DEBUG-ManageTours: rawSeatsAvailability missing, fetching seats specifically for modal.");
                const seats = await fetchTravelSeats(tour.id);
                setFetchedSeatsAvailability(seats);
                console.log("DEBUG-ManageTours: Seats for modal (fetched on demand):", seats);
            } catch (error: any) {
                console.error("Error fetching seats for booking modal:", error);
                setErrorSeatsForModal(error.message || "Failed to load seat availability.");
                setFetchedSeatsAvailability([]);
                toast({
                    title: "Error Loading Seats",
                    description: error.message || "Could not load seat availability for the selected trip.",
                    variant: "destructive",
                });
            } finally {
                setLoadingSeatsForModal(false);
            }
        }
    }, []);

    const handleBookingSuccess = useCallback(() => {
        fetchData(); // Refresh all data to get updated seat availability
        setIsBookingModalOpen(false);
        setSelectedTourForBooking(null);
    }, [fetchData]);


    return (
        <DashboardLayout showHeader={false}>
            <div className="flex flex-col p-6">
                <h1 className="text-[#F35B04] text-base font-bold tracking-[2.4px] uppercase mb-6">
                    MANAGE TOURS
                </h1>

                <div className="flex space-x-4 mb-8 border-b border-gray-200 pb-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={cn(
                            "px-6 py-2 rounded-t-lg font-medium text-sm transition-colors duration-200",
                            activeCategory === "all"
                                ? "bg-[#BEE3E2] text-gray-800 border-b-2 border-[#F35B04]"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        All Tours
                    </button>
                    <button
                        onClick={() => setActiveCategory("upcoming")}
                        className={cn(
                            "px-6 py-2 rounded-t-lg font-medium text-sm transition-colors duration-200",
                            activeCategory === "upcoming"
                                ? "bg-[#BEE3E2] text-gray-800 border-b-2 border-[#F35B04]"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveCategory("ongoing")}
                        className={cn(
                            "px-6 py-2 rounded-t-lg font-medium text-sm transition-colors duration-200",
                            activeCategory === "ongoing"
                                ? "bg-[#BEE3E2] text-gray-800 border-b-2 border-[#F35B04]"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        Ongoing
                    </button>
                    <button
                        onClick={() => setActiveCategory("completed")}
                        className={cn(
                            "px-6 py-2 rounded-t-lg font-medium text-sm transition-colors duration-200",
                            activeCategory === "completed"
                                ? "bg-[#BEE3E2] text-gray-800 border-b-2 border-[#F35B04]"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setActiveCategory("cancelled")}
                        className={cn(
                            "px-6 py-2 rounded-t-lg font-medium text-sm transition-colors duration-200",
                            activeCategory === "cancelled"
                                ? "bg-[#BEE3E2] text-gray-800 border-b-2 border-[#F35B04]"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        Cancelled
                    </button>
                </div>

                {/* Loading and Error States */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-[#F35B04]" />
                        <p className="ml-4 text-gray-600">Loading travels and drivers...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-600 p-8">
                        <p>Error: {error}</p>
                        <p className="mt-2 text-sm text-gray-500">Please try again later.</p>
                    </div>
                ) : allTravels.length === 0 ? (
                    <div className="text-center text-gray-600 p-8">
                        <p>No travels found for this agency.</p>
                        <p className="mt-2 text-sm text-gray-500">Add a new trip to get started!</p>
                    </div>
                ) : (
                    <div className="tour-table-container">
                        {renderTable()}
                    </div>
                )}
            </div>

            {/*
                IMPORTANT: The "Edit Travel Dialog" and related states/handlers
                (isEditModalOpen, editingTravel, formInput, isFormSubmitting,
                vehicles, destinations, handleEditClick, handleFormChange,
                handlePickupLocationChange, addPickupLocation, removePickupLocation,
                handleFormSubmit) have been REMOVED from this file as per your request
                to avoid interference with existing bus/driver logic.
                If this functionality is desired, it should be managed outside of this file,
                or re-integrated very carefully if needed here.
            */}

            {/* Booking Modal (Remains untouched) */}
            {selectedTourForBooking && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    tour={selectedTourForBooking}
                    onBookSuccess={handleBookingSuccess}
                    fetchedSeatsAvailability={fetchedSeatsAvailability}
                    loadingSeats={loadingSeatsForModal}
                    errorSeats={errorSeatsForModal}
                />
            )}
        </DashboardLayout>
    );
};

export default ManageTours;
