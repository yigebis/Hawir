// src/lib/api/advertisementService.ts

import { API_BASE_URL } from './config'; // Assuming you have a config.ts with API_BASE_URL

// --- Interfaces for API Responses and Payloads ---

export interface CloudinaryUploadPresetResponse {
    cloud_name: string;
    upload_preset: string;
}

export interface CloudinaryUploadResponse {
    secure_url: string;
    // Cloudinary returns many other fields, but we only need secure_url for this task
}

// Matches your Go backend's Advertisement struct for adding
export interface AdvertisementPayload {
    title: string;
    description: string;
    media_url: string; // Changed from imageUrl to media_url to match backend Go struct
    agency_id: string;
}

// Interface for a successfully added advertisement response from your backend
export interface AdvertisementResponse {
    id: string;
    title: string;
    description: string;
    media_url: string;
    agency_id: string;
    created_at: string; // ISO date string
}

// Interface for fetching existing advertisements (matching your mock data structure conceptually)
export interface FetchedAdvertisement {
    id: string;
    title: string;
    description: string;
    imageUrl: string; // Frontend expects this for img src
    uploadDate: string; // Frontend expects this for display
}


// --- API Functions ---

/**
 * Fetches the Cloudinary upload preset from your backend.
 * @param token The JWT authentication token.
 * @returns A promise that resolves to CloudinaryUploadPresetResponse.
 */
export const getCloudinaryUploadPreset = async (token: string): Promise<CloudinaryUploadPresetResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/advertisement/upload_preset`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            console.error(`Error fetching upload preset: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Failed to get Cloudinary upload preset:", error);
        throw new Error(error.message || "Failed to get Cloudinary upload credentials.");
    }
};

/**
 * Uploads an image file directly to Cloudinary.
 * @param file The image file to upload.
 * @param cloudName Your Cloudinary cloud name.
 * @param uploadPreset Your Cloudinary upload preset.
 * @param onProgress Callback for upload progress (0-100).
 * @returns A promise that resolves to CloudinaryUploadResponse.
 */
export const uploadImageToCloudinary = async (
    file: File,
    cloudName: string,
    uploadPreset: string,
    onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const xhr = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

            if (onProgress) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentCompleted = Math.round((event.loaded * 100) / event.total);
                        onProgress(percentCompleted);
                    }
                });
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        reject(new Error('Failed to parse Cloudinary response.'));
                    }
                } else {
                    let errorMessage = `Cloudinary upload failed: ${xhr.status} ${xhr.statusText}`;
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        errorMessage = errorResponse.error?.message || errorMessage;
                    } catch (e) { /* ignore */ }
                    reject(new Error(errorMessage));
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network error or CORS issue during Cloudinary upload.'));
            };

            xhr.send(formData);
        });

    } catch (error: any) {
        console.error("Failed to upload image to Cloudinary:", error);
        throw new Error(error.message || "Failed to upload image.");
    }
};

/**
 * Adds a new advertisement record to your backend database.
 * @param payload The advertisement data (title, description, media_url, agency_id).
 * @param token The JWT authentication token.
 * @returns A promise that resolves to AdvertisementResponse.
 */
export const addAdvertisement = async (payload: AdvertisementPayload, token: string): Promise<AdvertisementResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/advertisement/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            console.error(`Error adding advertisement to backend: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Failed to add advertisement to backend:", error);
        throw new Error(error.message || "Failed to save advertisement details.");
    }
};

/**
 * Fetches advertisements posted by the current agency from the backend.
 * @param agencyId The ID of the agency.
 * @returns A promise that resolves to an array of FetchedAdvertisement.
 */
export const fetchAdvertisements = async (agencyId: string): Promise<FetchedAdvertisement[]> => {
    try {
        console.log(`Fetching advertisements for agency: ${agencyId}`);
        const response = await fetch(`${API_BASE_URL}/advertisement/agency/${agencyId}`);

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            console.error(`Error fetching advertisements: ${errorMessage}`);
            // If it's a 404 (no ads found), return an empty array gracefully
            if (response.status === 404) {
                console.warn(`No advertisements found for agency ${agencyId} (404 Not Found). Returning empty array.`);
                return [];
            }
            throw new Error(errorMessage);
        }

        // Backend Advertisement struct: ID, Title, Description, MediaURL, AgencyID, CreatedAt
        let data: AdvertisementResponse[] | null = await response.json(); // Allow data to be null
        console.log("Fetched raw advertisement data:", data);

        // --- CRITICAL FIX: Handle null or non-array responses from backend ---
        if (!data || !Array.isArray(data)) {
            console.warn("Received null or non-array data for advertisements. Returning empty array.");
            return [];
        }

        // Map backend response to frontend's FetchedAdvertisement interface
        return data.map((ad) => ({
            id: ad.id,
            title: ad.title,
            description: ad.description,
            imageUrl: ad.media_url, // Map backend's media_url to frontend's imageUrl
            uploadDate: ad.created_at, // Map backend's created_at to frontend's uploadDate
        }));

    } catch (error: any) {
        console.error("Error fetching advertisements:", error);
        // Ensure to throw a clear error or return an empty array based on desired behavior
        // For fetchAdvertisements, returning empty array on error is generally more graceful for display.
        return []; // Return empty array on any fetch error to prevent UI crash
    }
};

/**
 * Deletes an advertisement by its ID from the backend.
 * @param id The ID of the advertisement to delete.
 * @param token The JWT authentication token.
 * @returns A promise that resolves to a success message.
 */
export const deleteAdvertisement = async (id: string, token: string): Promise<{ message: string }> => {
    try {
        console.log(`Attempting to delete advertisement with ID: ${id}`);
        const response = await fetch(`${API_BASE_URL}/advertisement/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            console.error(`Error deleting advertisement ${id}: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        const data: { message: string } = await response.json(); // Assuming backend returns a success message
        console.log(`Advertisement ${id} deleted successfully:`, data.message);
        return data;

    } catch (error: any) {
        console.error(`Failed to delete advertisement ${id}:`, error);
        throw new Error(error.message || "Failed to delete advertisement.");
    }
};
