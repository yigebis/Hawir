import { API_BASE_URL } from "@/lib/api/config"; // Assuming your API base URL is here

// Interface for the full Driver object (as returned by GET or after creation)
// Note: We're mapping Go's snake_case JSON tags to TypeScript's camelCase for consistency
// ID and Time fields are handled as strings as they come from backend (primitive.ObjectID, time.Time)
export interface Driver {
    id: string; // Go's primitive.ObjectID
    first_name: string;
    last_name: string;
    sex: string;
    date_of_birth: string; // ISO 8601 string from Go's time.Time
    email: string;
    phone: string;
    photo: File; // This will be the URL/path to the stored photo
    // Password is usually not returned in a GET/POST response for security
    agency_id: string;
    registration_date: string; // ISO 8601 string from Go's time.Time
    current_trips: string[];
    verified: boolean;
}

// *** REMOVED: CreateDriverPayload and UpdateDriverPayload interfaces ***
// These are no longer directly used for the request body, as we're sending FormData.
// The structure is implicitly handled by appending fields to FormData.

/**
 * Creates a new driver in the backend using FormData.
 *
 * @param token The authentication token from AuthContext.
 * @param driverFormData The FormData containing the new driver's data (including file).
 * @returns A Promise that resolves to a success message object.
 * @throws Error if the API call fails.
 */
export const createDriver = async (token: string, driverFormData: FormData): Promise<{ message: string }> => {
    if (!token) {
        throw new Error("Authentication token is missing. Cannot create driver.");
    }
    // No need to check for agency_id here, as it's extracted from the token on the backend.

    try {
        const response = await fetch(`${API_BASE_URL}/agency/driver/add`, {
            method: 'POST',
            headers: {
                // IMPORTANT: Do NOT set 'Content-Type': 'application/json' for FormData.
                // The browser automatically sets 'Content-Type: multipart/form-data'
                // with the correct boundary when you pass a FormData object directly.
                'Authorization': `Bearer ${token}`, // Use the provided token
            },
            body: driverFormData, // Pass the FormData object directly
        });

        const data = await response.json(); // Always attempt to parse JSON for error messages

        if (!response.ok) {
            // Backend's error format is { "error": "message" }
            throw new Error(data.error || `Failed to add driver: HTTP status ${response.status}`);
        }

        // Your backend returns a message object on success, e.g., { "message": "driver added successfully" }
        return data;

    } catch (error: any) {
        console.error("Error creating driver:", error);
        throw error; // Re-throw for the component to handle
    }
};

/**
 * Fetches all drivers for a specific agency.
 * This endpoint should be secured by your AgencyMiddleware to ensure the correct agency_id is used.
 * @param token The JWT authentication token.
 * @returns An array of Driver objects.
 * @throws Error if the API call fails.
 */
export async function getDriversByAgencyId(token: string): Promise<Driver[]> {
    console.log("Called first when fleet is opened");
    const response = await fetch(`${API_BASE_URL}/agency/driver/all`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json", // Keep for GET requests expecting JSON response
            "Authorization": `Bearer ${token}`,
        },
    });

    // Read the response body ONCE
    const data = await response.json();

    if (!response.ok) {
        // If response is not OK, data contains the error object { "error": "message" }
        throw new Error(data.error || `Failed to fetch drivers: ${response.statusText}`);
    }

    console.log("Fetched data:", data); // Log the parsed data

    // Ensure the response is always an array, even if the backend sends null for no results.
    return Array.isArray(data) ? data : [];
}

/**
 * Updates an existing driver's information using FormData.
 * @param token The JWT authentication token.
 * @param driverId The ID of the driver to update (passed in URL path).
 * @param driverFormData The FormData containing the partial data to update for the driver.
 * @returns A Promise that resolves to a success message object.
 * @throws Error if the API call fails.
 */
export async function updateDriver(token: string, driverId: string, driverFormData: FormData): Promise<{ message: string }> {
    // Note: The driverId is passed as a URL parameter, not within the FormData for this endpoint.
    // Ensure your Gin backend route is something like `router.PUT("/agency/driver/edit/:id", ...)`

    const response = await fetch(`${API_BASE_URL}/agency/driver/edit`, {
        method: "PUT",
        headers: {
            // IMPORTANT: Do NOT set 'Content-Type' for FormData.
            'Authorization': `Bearer ${token}`,
        },
        body: driverFormData, // Pass FormData directly
    });

    const data = await response.json(); // Always attempt to parse JSON for error messages

    if (!response.ok) {
        // Backend's error format is { "error": "message" }
        throw new Error(data.error || `Failed to update driver: HTTP status ${response.status}`);
    }

    // Your backend returns a message object on success
    return data;
}

/**
 * Soft-deletes a driver by setting their 'verified' status to false.
 * @param token The JWT authentication token.
 * @param driverId The ID of the driver to delete.
 * @returns A success message object.
 * @throws Error if the API call fails.
 */
export async function deleteDriver(token: string, driverId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/agency/driver/delete/${driverId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json", // This is fine, DELETE often doesn't need a body, but if it did, this is how you'd send JSON.
            "Authorization": `Bearer ${token}`,
        },
    });

    const data = await response.json(); // Always attempt to parse JSON for error messages

    if (!response.ok) {
        // Backend's error format is { "error": "message" }
        throw new Error(data.error || `Failed to delete driver: HTTP status ${response.status}`);
    }

    return data;
}