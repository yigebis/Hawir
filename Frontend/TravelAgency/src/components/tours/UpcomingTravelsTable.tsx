import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TravelEventType } from "@/components/travels/TravelEvent"; // Keep original TravelEventType for base structure
import { format, differenceInDays } from "date-fns";
import { Driver } from "@/lib/api/driver";
import { Button } from "@/components/ui/button";
import BookingModal from "./BookingModal"; // Keep as is
import { fetchTravelSeats, TravelWithSeats } from "@/lib/api/travelService"; // Import TravelWithSeats and fetchTravelSeats
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// CRITICAL CHANGE: Update the tours prop to use TravelWithSeats
interface UpcomingTravelsTableProps {
  tours: TravelWithSeats[]; // <-- Changed from TravelEventType[] to TravelWithSeats[]
  drivers: Driver[];
}

const UpcomingTravelsTable: React.FC<UpcomingTravelsTableProps> = ({ tours = [], drivers = [] }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  // Note: selectedTourForBooking still takes TravelEventType, as BookingModal expects it.
  const [selectedTourForBooking, setSelectedTourForBooking] = useState<TravelEventType | null>(null);
  const [selectedTourSeatsAvailability, setSelectedTourSeatsAvailability] = useState<boolean[] | null>(null);
  const [isFetchingSeatsForModal, setIsFetchingSeatsForModal] = useState(false);
  const [errorFetchingSeatsForModal, setErrorFetchingSeatsForModal] = useState<string | null>(null);

  const driverMap = useMemo(() => {
    const map = new Map<string, Driver>();
    drivers.forEach(driver => {
      map.set(driver.id, driver);
    });
    return map;
  }, [drivers]);

  const getDriverName = (driverId: string | undefined): string => {
    if (!driverId) return 'N/A';
    const driver = driverMap.get(driverId);
    return driver ? `${driver.first_name || ''} ${driver.last_name || ''}`.trim() : 'N/A';
  };

  // handleBookClick logic will now prioritize using already fetched rawSeatsAvailability
  const handleBookClick = useCallback(async (tour: TravelWithSeats) => { // Takes TravelWithSeats
    setSelectedTourForBooking(tour); // Still pass original TravelEventType to BookingModal
    setIsFetchingSeatsForModal(true);
    setErrorFetchingSeatsForModal(null);

    try {
      let seatsData: boolean[];
      // Prioritize using rawSeatsAvailability if already available from ManageTours
      if (tour.rawSeatsAvailability && tour.rawSeatsAvailability.length > 0) {
        seatsData = tour.rawSeatsAvailability;
        console.log("DEBUG-UpcomingTravelsTable: Using pre-fetched seats for modal.");
      } else {
        // Fallback: Fetch seats if not already available (shouldn't happen often now)
        console.warn("DEBUG-UpcomingTravelsTable: Pre-fetched seats missing, fetching for modal.");
        seatsData = await fetchTravelSeats(tour.id);
      }

      setSelectedTourSeatsAvailability(seatsData);
      setIsBookingModalOpen(true); // Open modal only after seats are determined
    } catch (error: any) {
      console.error("Error fetching seats for modal:", error);
      setErrorFetchingSeatsForModal(error.message || "Failed to load seat data. Please try again.");
      toast({
        title: "Error Loading Seats",
        description: error.message || "Could not retrieve seat availability for this trip.",
        variant: "destructive",
      });
      setIsBookingModalOpen(false); // Ensure modal does not open on error
    } finally {
      setIsFetchingSeatsForModal(false);
    }
  }, []);

  const handleBookingModalClose = useCallback(() => {
    setIsBookingModalOpen(false);
    setSelectedTourForBooking(null);
    setSelectedTourSeatsAvailability(null);
    setErrorFetchingSeatsForModal(null);
    // You might want to trigger a refresh of the main ManageTours data here
    // if a booking changes the seat availability in the list view,
    // which would require a prop function from ManageTours.
    // For now, assuming ManageTours's fetchData() will refresh on its own.
  }, []);

  return (
    <div className="rounded-lg border bg-[#F3F6FA] overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#BEE3E2]">
            <TableHead className="text-gray-700 font-medium text-center min-w-[100px]">Travel ID</TableHead>
            <TableHead className="text-gray-700 font-medium text-center min-w-[120px]">Beginning</TableHead>
            <TableHead className="text-gray-700 font-medium text-center min-w-[120px]">Destination</TableHead>
            <TableHead className="text-gray-700 font-medium text-center min-w-[150px]">Date</TableHead>
            <TableHead className="text-gray-700 font-medium text-center min-w-[100px]">Duration</TableHead>
            <TableHead className="text-gray-700 font-medium text-center min-w-[120px]">Driver</TableHead>
            <TableHead className="text-gray-700 font-medium text-center min-w-[120px]">Available Spots</TableHead>
            <TableHead className="text-gray-700 font-medium text-center min-w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tours.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No upcoming travels found.
              </TableCell>
            </TableRow>
          ) : (
            tours.map((tour) => {
              const startDate = tour.start ? new Date(tour.start) : null;
              const endDate = tour.end ? new Date(tour.end) : null;

              let duration = 'N/A';
              if (startDate && endDate && startDate <= endDate) {
                const diff = differenceInDays(endDate, startDate);
                duration = diff === 0 ? '1 day' : `${diff + 1} days`;
              } else if (startDate) {
                duration = '1 day';
              }

              // CRITICAL CHANGE: Calculate availableSpots from rawSeatsAvailability
              console.log("TOURSSSSSEATSSSS", tour.rawSeatsAvailability);
              const availableSeatsCount = tour.rawSeatsAvailability
                ? tour.rawSeatsAvailability.filter(s => !s).length
                : '...'; // Show '...' or spinner while loading

              return (
                <TableRow key={tour.id} className="bg-white hover:bg-gray-50 cursor-pointer">
                  <TableCell className="text-center text-sm">{tour.id}</TableCell>
                  <TableCell className="text-center text-sm">{tour.start_location || tour.location || 'N/A'}</TableCell>
                  <TableCell className="text-center text-sm">{tour.destination || 'N/A'}</TableCell>
                  <TableCell className="text-center text-sm">
                    {startDate ? format(startDate, "MMM do, yyyy") : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">{duration}</TableCell>
                  <TableCell className="text-center">{getDriverName(tour.driverId)}</TableCell>
                  {/* NEW: TableCell for Available Spots */}
                  <TableCell className="text-center">
                    {tour.rawSeatsAvailability ? (
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        typeof availableSeatsCount === "number"
                          ? availableSeatsCount <= 5
                            ? 'bg-red-100 text-red-800'
                            : availableSeatsCount <= 10
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          : ''
                        }`}>
                        {`${availableSeatsCount} / ${tour.totalSeats}`}
                      </span>
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400 inline-block" />
                    )}

                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      onClick={() => handleBookClick(tour)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs"
                      disabled={isFetchingSeatsForModal}
                    >
                      {isFetchingSeatsForModal && selectedTourForBooking?.id === tour.id ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Book"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Booking Modal Component - Only render if open AND we have tour and seat data */}
      {isBookingModalOpen && selectedTourForBooking && selectedTourSeatsAvailability && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleBookingModalClose}
          tour={selectedTourForBooking}
          fetchedSeatsAvailability={selectedTourSeatsAvailability}
          loadingSeats={false} // Seats are already loaded here
          errorSeats={null} // Errors handled by parent, so pass null
        />
      )}
    </div>
  );
};

export default UpcomingTravelsTable;
