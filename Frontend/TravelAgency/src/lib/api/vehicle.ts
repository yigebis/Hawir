// src/lib/api/vehicle.ts
import { API_BASE_URL } from "@/lib/api/config"; // Assuming your API base URL is here

// Define the API response structure for a single bus
export interface Bus {
    id: string; // From primitive.ObjectID
    plate_number: string;
    agency_id: string;
    capacity: number;
    registration_date: string; // time.Time will be string (ISO 8601)
    description: string;
    is_reserved: boolean;
    status: string;
    current_trip: string[]; // current_trip from backend
}

// Define the fields required for adding a bus (matching your backend's expected JSON)
// Note: agency_id, registration_date, is_reserved, status, current_trip will be handled by backend
export interface AddBusPayload {
    plate_number: string;
    capacity: number;
    description?: string; // Optional for backend, so make it optional here too
}

// Define the fields required for updating a bus (matching your backend's expected JSON)
export interface UpdateBusPayload {
    plate_number?: string;
    capacity?: number;
    description?: string;
    is_reserved?: boolean;
    status?: string;
    current_trip?: string[];
}

// Helper function to handle fetch API responses
async function handleResponse(response: Response) {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// API function to add a new bus
export const addBus = async (token: string, busData: AddBusPayload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/agency/bus/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(busData), // Convert data to JSON string
        });
        return await handleResponse(response); // Should return { message: "bus added successfully" }
    } catch (error: any) { // Type as any for consistent error handling
        throw new Error(error.message || "Failed to add bus.");
    }
};

// API function to get all buses for an agency
export const getBusesByAgencyId = async (token: string): Promise<Bus[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/agency/bus/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await handleResponse(response);
        console.log("Fetched buses:", data);
        // The backend might return an array directly, or an object with a 'buses' key.
        // Adjust this line based on your actual backend response structure.
        // If your backend returns { buses: [...] }, then use data.buses
        return data; // Assuming it returns an array of Bus objects directly
    } catch (error: any) {
        throw new Error(error.message || "Failed to fetch buses.");
    }
};

// API function to update a bus
export const updateBus = async (token: string, busId: string, busData: UpdateBusPayload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/agency/bus/edit/${busId}`, { // Assuming endpoint for update
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(busData),
        });
        return await handleResponse(response);
    } catch (error: any) {
        throw new Error(error.message || "Failed to update bus.");
    }
};

// API function to delete a bus
export const deleteBus = async (token: string, busId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/agency/bus/${busId}`, { // Assuming endpoint for delete
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        // For DELETE, backend might return empty success or a message
        return await handleResponse(response); // Will throw if not ok
    } catch (error: any) {
        throw new Error(error.message || "Failed to delete bus.");
    }
};