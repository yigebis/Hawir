
// src/lib/api/trip.ts

import { API_BASE_URL } from "@/lib/api/config"; // Assuming you have your base API URL defined here

export interface CreateTripPayload {
    agency_id: string; // You'll likely need to get this dynamically
    start_location: string;
    pickup_locations: string[]; // Or adjust based on your UI
    destination: string;
    planned_start_time: string; // ISO 8601 format
    est_arrival_time: string;   // ISO 8601 format
    price: number;
    total_seats: number;
    bus_ref: string;
    driver_name?: string; // Optional
    status?: string;      // Optional, might be set on the backend
}

export const createNewTrip = async (tripData: CreateTripPayload): Promise<Response> => {
    try {
        const response = await fetch(`${API_BASE_URL}/travel/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tripData),
        });

        return response;
    } catch (error: any) {
        console.error("Error creating new trip:", error);
        throw error; // Re-throw the error for the component to handle
    }
};

// Add update trip function
export interface UpdateTripPayload extends CreateTripPayload {
    id: string; // Include the ID for updating
}

export const updateTrip = async (tripData: UpdateTripPayload): Promise<Response> => {
    try {
        const response = await fetch(`${API_BASE_URL}/travel/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tripData),
        });
        return response;
    } catch (error: any) {
        console.error("Error updating trip:", error);
        throw error;
    }
};

export const deleteTrip = async (tripId: string): Promise<Response> => {
    try {
        const response = await fetch(`${API_BASE_URL}/travel/cancel/${tripId}`, { // Assuming you have a delete endpoint
            method: 'DELETE',
        });
        return response;
    } catch (error: any) {
        console.error("Error deleting trip:", error);
        throw error;
    }
};