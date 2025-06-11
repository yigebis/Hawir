// src/lib/api/destination.ts

import { API_BASE_URL } from "@/lib/api/config"; // Assuming you have a config file for your API base URL

export interface Destination {
    id: string; // Assuming the backendObjectID is sent as a string
    name: string;
    stations: string[];
}

export const getAllDestinations = async (): Promise<Destination[]> => {
    try {
        // Adjust the endpoint if needed, keeping /destination/all for fetching all
        const response = await fetch(`${API_BASE_URL}/destination/all`);
        if (!response.ok) {
            // Attempt to parse error message from the response body if available
            const errorBody = await response.text(); // Read as text first to avoid JSON parsing errors on non-JSON responses
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorBody);
                errorMessage = errorJson.message || errorMessage;
            } catch (e) {
                // Ignore if parsing fails, use the default HTTP error message
            }
            throw new Error(errorMessage);
        }
        // The backend returns ApiResponse<Destination[]>, so we expect data.data to be Destination[]
        const data: Destination[] = await response.json();
        console.log("Fetched destinations:");
        console.log(data);
        return data;
    } catch (error: any) {
        console.error("Error fetching destinations:", error);
        // Re-throw the error so calling code can handle it
        throw error;
    }
};
