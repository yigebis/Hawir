// src/lib/api/destination.ts

import { API_BASE_URL } from "@/lib/api/config"; // Assuming you have a config file for your API base URL

export interface Destination {
    id: string;
    name: string;
    latitude: string;
    longitude: string;
    description: string;
    hotels: Hotel[][];
    culture: string;
    history: string;
    population: string;
    touristAttractions: TouristAttraction[][];
    post_date: string; // Or Date, depending on how you want to handle it
}

interface Hotel {
    name: string;
    imageUrl: string;
    mapLink: string;
}

interface TouristAttraction {
    name: string;
    desc: string;
    imageUrl: string;
}

interface ApiResponse<T> {
    data: T;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const getAllDestinations = async (): Promise<Destination[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/destination/all`); // Adjust the endpoint if needed
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        const data: ApiResponse<Destination[]> = await response.json();
        return data.data;
    } catch (error: any) {
        console.error("Error fetching destinations:", error);
        throw error;
    }
};