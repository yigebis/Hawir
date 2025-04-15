// src/lib/api/bookingService.ts
import { API_BASE_URL } from './config';

interface Booking {
    id: string;
    travel_id: string;
    passengerName: string;
    seatNumber: string;
    passengerPhone: string;
    departureLocation: string;
    bookingTime: string;
    bookingTimeLimit: string;
    paymentStatus: "Paid" | "Booked";
    // Add other relevant booking properties based on your backend response
}

export const fetchBookingsForTravel = async (travelId: string): Promise<Booking[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/travel/${travelId}`); // Adjust your API endpoint

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching bookings:", errorData);
            throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data: Booking[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw error;
    }
};