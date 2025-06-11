// src/lib/api/travelService.ts

import { TravelEventType as OriginalTravelEventType } from "@/components/travels/TravelEvent";
import { API_BASE_URL } from './config';
// import { TravelBooking } from "@/types/travelBooking"; // Keep this if you use it elsewhere

// --- Your provided core interfaces ---

export interface Travel {
    id: string; // Or string if you're not directly using MongoDB ObjectIDs
    agency_id: string;
    start_location: string;
    pickup_locations: string[];
    destination: string;
    planned_start_time: string; // Or Date, depending on how you want to handle it
    actual_start_time: string; // Or Date
    est_arrival_time: string; // Or Date
    actual_arrival_time: string; // Or Date
    price: number;
    total_seats: number;
    bus_ref: string;
    driver_id: string;
    post_time: string; // or Date
    last_mod_time: string; // or Date
    status: string;
}

export interface TravelStats {
    travel_id: string;
    seats: boolean[];
    reserved_count: number;
    avg_rating: number;
    rated_by: number;
}

export interface Vehicle {
    id: string;
    carNumber: string;
    capacity: string;
    assignedDriver: string;
    status: 'Available' | 'In Service' | 'Maintenance';
}

export interface TravelRating {
    id?: string; // Maps to Go's primitive.ObjectID
    travel_id: string;
    rating: number; // Maps to Go's float64
    total_rating_sum: number; // Maps to Go's int64
    total_rating_count: number; // Maps to Go's int64
}

export interface RatingAndFeedback { // This represents an individual review/feedback
    comment?: string; // `omitempty` in Go
    rating?: number; // `omitempty` in Go, int64
    travel_id: string;
    traveler_name: string;
    traveler_photo: string;
    post_time?: string; // Maps to Go's time.Time (will be an ISO string)
}

export interface AgencyRating {
    id?: string; // Maps to Go's primitive.ObjectID
    agency_id: string;
    rating: number; // Maps to Go's float64
    total_rating_sum: number; // Maps to Go's int64
    total_rating_count: number; // Maps to Go's int64
}

// --- Your provided Payment interface (used inside Booking) ---
export interface Payment {
    current_payment_ref?: string;
    payment_successful?: boolean;
    failed_payment_ref?: string[];
}

// --- Your provided Booking interface (the payload for /booking/add/agency) ---
export interface Booking {
    // Backend-generated/managed fields (omit from frontend payload unless explicitly required by backend validation)
    id?: string;
    booking_ref?: string;
    book_time?: string;
    pay_time?: string;
    book_time_limit?: string;
    status?: string;
    notification_sent?: boolean;

    // Fields collected from frontend or tour prop
    travel_id?: string;
    traveler_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    seat_no: number;
    trip_type?: string;
    start_location: string;
    destination: string;
    price: number;
    payment_type?: string;
    payment_ref?: Payment;
}

// --- Your provided Seat interface (the payload for /booking/seat/choose) ---
export interface Seat {
    travel_id: string;
    traveler_id: string;
    seat_no: number;
    max_time?: string;
}

// --- NEW: Extended TravelEventType to include raw seat availability for display ---
// This extends the original TravelEventType from "@/components/travels/TravelEvent"
// and will be used by ManageTours and the individual table components.
export interface TravelWithSeats extends OriginalTravelEventType {
    rawSeatsAvailability?: boolean[]; // Array of booleans (true = taken, false = available)
}


export const fetchTravels = async (agencyId: string): Promise<TravelWithSeats[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/travels/${agencyId}`);

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            console.error(`fetchTravels API returned error: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        const data: Travel[] = await response.json();
        console.log("DEBUG-travelService: Fetched raw travel data:", data);

        // Concurrently fetch seat availability for each travel
        const travelsWithSeatsPromises = data.map(async (travel) => {
            let seats: boolean[] = [];
            try {
                // fetchTravelSeats does not require auth token if it's public info
                seats = await fetchTravelSeats(travel.id);
            } catch (error) {
                console.error(`Failed to fetch seats for travel ${travel.id}:`, error);
                seats = []; // Default to empty array on error to prevent breaking the display
            }

            // Transform to the original TravelEventType structure, then add rawSeatsAvailability
            const originalTravelEvent: OriginalTravelEventType = {
                id: travel.id,
                start_location: travel.start_location,
                start: new Date(travel.planned_start_time),
                terminals: travel.pickup_locations,
                end: new Date(travel.est_arrival_time),
                color: "blue", // Assuming default color
                location: travel.start_location,
                destination: travel.destination,
                price: travel.price,
                busRef: travel.bus_ref,
                totalSeats: travel.total_seats,
                driverId: travel.driver_id,
                last_mod_time: new Date(travel.last_mod_time),
                status: determineStatus(travel),
            };

            return {
                ...originalTravelEvent,
                rawSeatsAvailability: seats, // Add the fetched seat data
            } as TravelWithSeats;
        });

        const transformedEvents = await Promise.all(travelsWithSeatsPromises);
        return transformedEvents;

    } catch (error: any) {
        console.error("Error fetching travels:", error);
        throw new Error(error.message || "Failed to fetch travels from the server.");
    }
};

// Helper function to determine status based on dates
const determineStatus = (travel: Travel): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' => {
    // Retaining your provided logic for status determination.
    if (travel.status === "upcoming") {
        return 'upcoming';
    } else if (travel.status === "ongoing") {
        return 'ongoing';
    }
    else if (travel.status === "cancelled") {
        return 'cancelled';
    } else {
        return 'completed';
    }
};

export const updateTravel = async (travelId: string, travelData: Partial<Travel>): Promise<Travel> => {
    try {
        const response = await fetch(`${API_BASE_URL}/travel/${travelId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(travelData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) { errorMessage = errorText || errorMessage; }
            console.error(`Error updating travel: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error updating travel:", error);
        throw new Error(error.message || "Failed to update travel.");
    }
};

export const fetchTravelBookings = async (travelId: string): Promise<any[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/booking/all/${travelId}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch bookings' }));
            throw new Error(errorData.message || `Failed to fetch bookings: ${response.status}`);
        }
        let rawData: unknown = await response.json();
        if (!rawData || !Array.isArray(rawData)) { rawData = []; }
        return rawData as any[];
    } catch (error: any) {
        console.error(`Error fetching bookings for travel ID ${travelId}:`, error);
        throw new Error(error.message || "Failed to fetch travel bookings.");
    }
};

export const fetchTravelReviews = async (travelId: string): Promise<RatingAndFeedback[]> => {
    try {
        console.log(`DEBUG-travelService: Attempting to fetch reviews for travelId: ${travelId}`);
        const response = await fetch(`${API_BASE_URL}/reviews/${travelId}`);

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            console.error(`Error fetching reviews for travel ${travelId}: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        const rawData: unknown = await response.json();
        console.log(`DEBUG-travelService: Fetched reviews for travel ${travelId}:`, rawData);

        return (Array.isArray(rawData) ? rawData : []) as RatingAndFeedback[];

    } catch (error: any) {
        console.error(`Caught error fetching reviews for travel ${travelId}:`, error);
        return [];
    }
};

export const fetchTravelRating = async (travelId: string): Promise<TravelRating | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/rating/${travelId}`);

        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`No rating found for travel ${travelId} (404 Not Found).`);
                return null;
            }
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            console.error(`Error fetching rating for travel ${travelId}: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        const rawData: unknown = await response.json();
        console.log(`DEBUG-travelService: Fetched rating for travel ${travelId}:`, rawData);

        if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
            return null;
        }

        return rawData as TravelRating;

    } catch (error: any) {
        console.error(`Caught error fetching rating for travel ${travelId}:`, error);
        return null;
    }
};

export const fetchAgencyRating = async (agencyId: string): Promise<AgencyRating | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/rating/agency/${agencyId}`);

        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`No agency rating found for agency ${agencyId} (404 Not Found).`);
                return null;
            }
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            console.error(`Error fetching agency rating for agency ${agencyId}: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        const rawData: unknown = await response.json();
        console.log(`DEBUG-travelService: Fetched rating for agency ${agencyId}:`, rawData);

        if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
            return null;
        }

        return rawData as AgencyRating;

    } catch (error: any) {
        console.error(`Caught error fetching agency rating for agency ${agencyId}:`, error);
        return null;
    }
};

export const fetchTravelSeats = async (travelId: string): Promise<boolean[]> => {
    try {
        console.log(`DEBUG-travelService: Attempting to fetch seats for travelId: ${travelId}`);
        const response = await fetch(`${API_BASE_URL}/booking/seats/${travelId}`);

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) { errorMessage = errorText || errorMessage; }
            console.error(`Error fetching seats for travel ${travelId}: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        const rawData: unknown = await response.json();
        console.log(`DEBUG-travelService: Fetched seats raw data for ${travelId}:`, rawData);

        if (Array.isArray(rawData) && rawData.every(item => typeof item === 'boolean')) {
            console.log(`DEBUG-travelService: Successfully parsed rawData as direct boolean array.`);
            return rawData as boolean[];
        }
        else if (rawData && typeof rawData === 'object' && 'seats' in rawData && Array.isArray((rawData as TravelStats).seats) && (rawData as TravelStats).seats.every(item => typeof item === 'boolean')) {
            console.log(`DEBUG-travelService: Successfully parsed rawData from TravelStats object.`);
            return (rawData as TravelStats).seats;
        }
        else {
            console.warn(`fetchTravelSeats: Received unexpected data format for travelId: ${travelId}. Expected boolean[] or TravelStats object with 'seats' array. Returning empty array.`);
            return [];
        }

    } catch (error: any) {
        console.error(`Caught error fetching seats for travel ${travelId}:`, error);
        return [];
    }
};

export const createBooking = async (bookingData: Booking, token: string): Promise<Booking> => {
    try {
        console.log("DEBUG-travelService: Sending booking payload:", bookingData);
        const response = await fetch(`${API_BASE_URL}/booking/add/agency`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) { errorMessage = errorText || errorMessage; }
            console.error(`Error creating booking: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        const data: unknown = await response.json();
        if (!data || typeof data !== 'object') {
            throw new Error("Invalid response data for createBooking.");
        }
        console.log("DEBUG-travelService: Booking successful, response:", data);
        return data as Booking;
    } catch (error: any) {
        console.error("Caught error creating booking:", error);
        throw new Error(error.message || "Failed to create booking.");
    }
};

export const chooseSeat = async (seatData: Seat, token: string): Promise<{ message: string }> => {
    try {
        console.log("DEBUG-travelService: Sending chooseSeat payload:", seatData);
        const response = await fetch(`${API_BASE_URL}/booking/seat/choose`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(seatData),
        });

        const responseData = await response.json();

        if (!response.ok) {
            const errorMessage = responseData.error || `HTTP error! status: ${response.status}`;
            console.error(`Error choosing seat: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        console.log("DEBUG-travelService: Choose seat successful, response:", responseData);
        return responseData as { message: string };
    } catch (error: any) {
        console.error("Caught error choosing seat:", error);
        throw new Error(error.message || "Failed to choose seat.");
    }
};
