import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, Star, Loader2, UserCircle } from "lucide-react";
import { TravelEventType } from "@/components/travels/TravelEvent";
import { format, differenceInDays } from "date-fns";
import { Driver } from "@/lib/api/driver";
import {
  fetchTravelReviews,
  fetchTravelRating,
  TravelRating,
} from "@/lib/api/travelService";

// --- Updated RatingAndFeedback Interface to match your backend ---
export interface RatingAndFeedback {
  comment?: string;
  rating?: number;
  travel_id: string;
  traveler_name: string;
  traveler_photo: string; // Ensure this is definitely a string type that contains the URL
  post_time?: string;
}

// Define the props interface for CompletedTravelsTable
interface CompletedTravelsTableProps {
  tours: TravelEventType[];
  drivers: Driver[];
}

const CompletedTravelsTable: React.FC<CompletedTravelsTableProps> = ({ tours = [], drivers = [] }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [reviewsMap, setReviewsMap] = useState<Map<string, RatingAndFeedback[]>>(new Map());
  const [travelRatingsMap, setTravelRatingsMap] = useState<Map<string, TravelRating>>(new Map());

  const [loadingReviews, setLoadingReviews] = useState<string | null>(null);
  const [errorReviews, setErrorReviews] = useState<Map<string, string>>(new Map());

  const [loadingRatings, setLoadingRatings] = useState(true);
  const [errorRatings, setErrorRatings] = useState<string | null>(null);

  const driverMap = React.useMemo(() => {
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

  const formatDateAndTimeLocal = (isoDateString: string | Date) => {
    try {
      const date = typeof isoDateString === 'string' ? new Date(isoDateString) : isoDateString;
      if (isNaN(date.getTime())) return "Invalid Date";
      return format(date, "yyyy-MM-dd h:mm a");
    } catch (error) {
      console.error("Error parsing date:", error);
      return "Invalid Date";
    }
  };

  useEffect(() => {
    const fetchAllRatings = async () => {
      setLoadingRatings(true);
      setErrorRatings(null);
      const newRatingsMap = new Map<string, TravelRating>();

      const promises = tours.map(async (tour) => {
        try {
          const rating = await fetchTravelRating(tour.id);
          if (rating) {
            newRatingsMap.set(tour.id, rating);
          }
        } catch (err: any) {
          console.error(`Failed to fetch rating for tour ${tour.id}:`, err);
        }
      });

      await Promise.allSettled(promises);
      setTravelRatingsMap(newRatingsMap);
      setLoadingRatings(false);
    };

    if (tours.length > 0) {
      fetchAllRatings();
    } else if (tours.length === 0) {
      setLoadingRatings(false);
      setTravelRatingsMap(new Map());
    }
  }, [tours]);

  const toggleFeedback = useCallback(async (tourId: string) => {
    console.log(`DEBUG-toggleFeedback: Called for tourId: ${tourId}. Current expandedRow: ${expandedRow}`);

    if (expandedRow === tourId) {
      setExpandedRow(null);
      console.log(`DEBUG-toggleFeedback: Collapsing row ${tourId}.`);
    } else {
      setExpandedRow(tourId);
      console.log(`DEBUG-toggleFeedback: Expanding row ${tourId}.`);

      const currentReviews = reviewsMap.get(tourId);
      const alreadyFetchedAndEmpty = currentReviews !== undefined && currentReviews.length === 0;
      const hasPreviousError = errorReviews.has(tourId);

      console.log(`DEBUG-toggleFeedback: tourId ${tourId}. currentReviews:`, currentReviews, `alreadyFetchedAndEmpty: ${alreadyFetchedAndEmpty}, hasPreviousError: ${hasPreviousError}`);

      if (currentReviews === undefined || alreadyFetchedAndEmpty || hasPreviousError) {
        console.log(`DEBUG-toggleFeedback: Initiating fetch for reviews for tourId: ${tourId}. Condition met.`);
        setLoadingReviews(tourId);
        setErrorReviews(prev => {
          const newMap = new Map(prev);
          newMap.delete(tourId);
          return newMap;
        });

        try {
          const fetchedReviews = await fetchTravelReviews(tourId);
          console.log(`DEBUG-toggleFeedback: Fetched reviews successfully for ${tourId}:`, fetchedReviews);
          setReviewsMap(prev => {
            const newMap = new Map(prev);
            newMap.set(tourId, fetchedReviews);
            return newMap;
          });
        } catch (err: any) {
          console.error(`DEBUG-toggleFeedback: Failed to fetch reviews for tour ${tourId}:`, err);
          setErrorReviews(prev => {
            const newMap = new Map(prev);
            newMap.set(tourId, err.message || "Failed to load feedback.");
            return newMap;
          });
        } finally {
          setLoadingReviews(null);
          console.log(`DEBUG-toggleFeedback: Fetch process finished for tourId: ${tourId}.`);
        }
      } else {
        console.log(`DEBUG-toggleFeedback: Reviews for tourId: ${tourId} already loaded and not empty. Skipping fetch.`);
      }
    }
  }, [expandedRow, reviewsMap, errorReviews]);

  return (
    <div className="rounded-lg border bg-[#F3F6FA] overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#BEE3E2]">
            <TableHead className="text-gray-700 font-medium text-center">Travel ID</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Beginning</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Destination</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Date</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Duration</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Driver</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Revenue</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Rating</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Feedback</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingRatings ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin mr-2 text-[#F35B04]" />
                  <span className="text-gray-600">Loading ratings...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : errorRatings ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-red-600">
                Error loading ratings: {errorRatings}. Please refresh.
              </TableCell>
            </TableRow>
          ) : tours.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                No completed travels found.
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

              const revenue = (tour.price || 0) * (tour.totalSeats || 0);
              const formattedRevenue = `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

              const travelRating = travelRatingsMap.get(tour.id);
              const tourReviews = reviewsMap.get(tour.id); // Can be undefined, empty array, or array with data
              const currentReviewError = errorReviews.get(tour.id);

              // Determine button text based on review state
              let feedbackButtonText = "View Feedback";
              if (loadingReviews === tour.id) {
                feedbackButtonText = "Loading...";
              } else if (currentReviewError) {
                feedbackButtonText = "Error Loading";
              } else if (tourReviews !== undefined && tourReviews.length === 0) {
                feedbackButtonText = "No feedback"; // Explicitly says "No feedback" if fetched and confirmed empty
              }


              return (
                <React.Fragment key={tour.id}>
                  <TableRow className="bg-white">
                    <TableCell className="text-center">{tour.id}</TableCell>
                    <TableCell className="text-center">{tour.start_location || tour.location || 'N/A'}</TableCell>
                    <TableCell className="text-center">{tour.destination || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      {startDate ? format(startDate, "EEEE MMMM do, yyyy") : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">{duration}</TableCell>
                    <TableCell className="text-center">{getDriverName(tour.driverId)}</TableCell>
                    <TableCell className="text-center">{formattedRevenue}</TableCell>

                    <TableCell className="text-center">
                      {travelRating ? (
                        <div className="flex items-center justify-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                          <span className="font-semibold">
                            {travelRating.rating.toFixed(1)}
                          </span>
                          <span className="text-gray-500 text-sm ml-1">
                            ({travelRating.total_rating_count})
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No rating</span>
                      )}
                    </TableCell>

                    {/* --- View Feedback Button --- */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleFeedback(tour.id)}
                        className={`flex items-center justify-center mx-auto transition-colors duration-200
                                ${loadingReviews === tour.id ? 'text-blue-600' : ''}
                                ${currentReviewError ? 'text-red-600 hover:text-red-800' : ''}
                                ${tourReviews !== undefined && tourReviews.length > 0 ? 'text-blue-600 hover:text-blue-800' : ''}
                                ${tourReviews !== undefined && tourReviews.length === 0 ? 'text-gray-500 hover:text-gray-600' : ''}
                                ${tourReviews === undefined ? 'text-blue-600 hover:text-blue-800' : ''}
                            `}
                        disabled={loadingReviews === tour.id}
                      >
                        {loadingReviews === tour.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          // No icon for error state as it's shown in text
                          // No icon for 'No feedback' either
                          // Only show icon if not loading, not error, and either has reviews or not yet fetched
                          (tourReviews === undefined || (tourReviews && tourReviews.length > 0)) && (
                            expandedRow === tour.id ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            )
                          )
                        )}
                        {feedbackButtonText}
                      </button>
                    </TableCell>
                  </TableRow>
                  {expandedRow === tour.id && (
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={9} className="p-0">
                        <div className="p-4 border-t border-gray-200">
                          <h4 className="font-medium mb-2 text-lg">
                            Traveler Feedback ({tourReviews ? tourReviews.length : 0})
                          </h4>
                          {loadingReviews === tour.id ? (
                            <div className="flex justify-center items-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin mr-2 text-blue-500" />
                              <span className="text-gray-600">Loading reviews...</span>
                            </div>
                          ) : currentReviewError ? (
                            <div className="py-4 text-center text-red-600">
                              Error: {currentReviewError}
                            </div>
                          ) : tourReviews && tourReviews.length === 0 ? (
                            <div className="py-4 text-center text-gray-600">
                              No feedback submitted for this trip yet.
                            </div>
                          ) : (
                            // --- SCROLLABLE FEEDBACK SECTION ---
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2"> {/* Added max-h-64 and overflow-y-auto */}
                              {tourReviews && tourReviews.map((item, index) => (
                                <div
                                  key={item.travel_id + item.traveler_name + (item.post_time || String(index))}
                                  className="bg-white p-3 rounded-md border border-gray-100"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      {item.traveler_photo ? (
                                        <img
                                          src={item.traveler_photo}
                                          alt={item.traveler_name || "Traveler"}
                                          className="w-8 h-8 rounded-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "https://placehold.co/32x32/cccccc/444444?text=NP";
                                            console.error(`Error loading traveler photo for ${item.traveler_name}:`, e.currentTarget.src, e);
                                          }}
                                        />
                                      ) : (
                                        <UserCircle className="w-8 h-8 text-gray-400" />
                                      )}
                                      <span className="font-medium text-gray-800">{item.traveler_name}</span>
                                    </div>
                                    <div className="flex items-center">
                                      {Array.from({ length: item.rating || 0 }).map((_, i) => (
                                        <Star key={i} className="h-4 w-4 text-yellow-500" fill="currentColor" />
                                      ))}
                                      {Array.from({ length: 5 - (item.rating || 0) }).map((_, i) => (
                                        <Star key={i} className="h-4 w-4 text-gray-300" />
                                      ))}
                                      <span className="ml-2 text-sm text-gray-600">({item.rating || 0}/5)</span>
                                    </div>
                                  </div>
                                  {item.comment && <p className="text-gray-600 mt-1">{item.comment}</p>}
                                  {item.post_time && <p className="text-xs text-gray-500 mt-1">Posted: {formatDateAndTimeLocal(item.post_time)}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompletedTravelsTable;
