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
    driver_id: string; // Optional
    status?: string;      // Optional, might be set on the backend
}

export const createNewTrip = async (token: string, tripData: CreateTripPayload): Promise<any> => { // Change return type to any or void
    if (!token) {
        throw new Error("Authentication token is missing for createNewTrip.");
    }

    try {
        console.log("Creatng new trip: ", tripData);
        const response = await fetch(`${API_BASE_URL}/travel/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Corrected header name capitalization
            },
            body: JSON.stringify(tripData),
        });

        // Check if the response was successful
        if (!response.ok) {
            const errorBody = await response.text(); // Read body as text first
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorBody);
                errorMessage = errorJson.message || errorMessage;
            } catch (e) {
                // If parsing fails, just use the status error
            }
            throw new Error(`Failed to create trip: ${errorMessage}`);
        }

        if (response.status === 204) return; // No Content
        return await response.json();

    } catch (error: any) {
        console.error("Error creating new trip:", error);
        throw error; // Re-throw the error for the component to handle
    }
};

// Add update trip function
export interface UpdateTripPayload extends CreateTripPayload {
    id: string; // Include the ID for updating
}

export const updateTrip = async (token: string, tripData: UpdateTripPayload): Promise<any> => { // Change return type
    if (!token) {
        throw new Error("Authentication token is missing for updateTrip.");
    }
    if (!tripData.id) {
        throw new Error("Trip ID is missing for updateTrip.");
    }

    try {
        const response = await fetch(`${API_BASE_URL}/travel/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Added Authorization header
            },
            body: JSON.stringify(tripData),
        });

        // Check if the response was successful
        if (!response.ok) {
            const errorBody = await response.text(); // Read body as text first
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorBody);
                errorMessage = errorJson.message || errorMessage;
            } catch (e) {
                // If parsing fails, just use the status error
            }
            throw new Error(`Failed to update trip: ${errorMessage}`);
        }

        if (response.status === 204) return; // No Content
        return await response.json();

    } catch (error: any) {
        console.error("Error updating trip:", error);
        throw error;
    }
};

// Add token as the first argument
export const deleteTrip = async (token: string, tripId: string): Promise<any> => { // Change return type
    if (!token) {
        throw new Error("Authentication token is missing for deleteTrip.");
    }
    if (!tripId) {
        throw new Error("Trip ID is missing for deleteTrip.");
    }

    try {
        const response = await fetch(`${API_BASE_URL}/travel/cancel/${tripId}`, { // Assuming you have a delete endpoint
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`, // Added Authorization header
            },
        });

        // Check if the response was successful
        if (!response.ok) {
            const errorBody = await response.text(); // Read body as text first
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorBody);
                errorMessage = errorJson.message || errorMessage;
            } catch (e) {
                // If parsing fails, just use the status error
            }
            throw new Error(`Failed to delete trip: ${errorMessage}`);
        }

        // Assuming the backend returns JSON data on success, parse and return it
        if (response.status === 204) return; // No Content
        return await response.json();

    } catch (error: any) {
        console.error("Error deleting trip:", error);
        throw error;
    }
};