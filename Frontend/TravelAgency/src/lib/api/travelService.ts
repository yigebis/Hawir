
import { TravelEventType } from "@/components/travels/TravelEvent";
import { API_BASE_URL } from './config'; 
import { TravelBooking } from "@/types/travelBooking";

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
    driver_name: string;
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

export const fetchTravels = async (agencyId: string): Promise<TravelEventType[]> => { // Add agencyId as a parameter
    try {
        const response = await fetch(`${API_BASE_URL}/travels/${agencyId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Travel[] = await response.json();

        const transformedEvents: TravelEventType[] = data.map((travel) => ({
            id: travel.id,
            title: `${travel.start_location} → ${travel.destination}`,
            start: new Date(travel.planned_start_time),
            terminals: travel.pickup_locations,
            end: new Date(travel.est_arrival_time),
            color: "blue",
            // Add more detailed data for editing
            location: travel.start_location,
            destination: travel.destination,
            price: travel.price,
            busRef: travel.bus_ref,
            totalSeats: travel.total_seats,
            driverName: travel.driver_name,
            status: determineStatus(travel),
        }));

        return transformedEvents;
    } catch (error) {
        console.error("Error fetching travels:", error);
        throw error;
    }
};

// Helper function to determine status based on dates
const determineStatus = (travel: Travel): 'upcoming' | 'ongoing' | 'completed' => {
    if (travel.status === "upcoming") {
        return 'upcoming';
    } else if (travel.status === "ongoing") {
        return 'ongoing';
    } else {
        return 'completed';
    }
};

// Add update travel function
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating travel:", error);
        throw error;
    }
};

export const fetchTravelBookings = async (travelId: string): Promise<TravelBooking[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/booking/all/${travelId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch bookings: ${response.status}`);
        }
        return await response.json() as TravelBooking[];
    } catch (error: any) {
        console.error(`Error fetching bookings for travel ID ${travelId}:`, error);
        throw error;
    }
};

// Add fetch vehicles function
export const fetchVehicles = async (agencyId: string): Promise<Vehicle[]> => {
    try {
        // This is a mock implementation since we're using sample data
        // In a real application, we would make an API call here
        const mockVehicles: Vehicle[] = [
            {
                id: "V001",
                carNumber: "AA-1234",
                capacity: "50 seats",
                assignedDriver: "Alex T.",
                status: "Available"
            },
            {
                id: "V002",
                carNumber: "AB-5678",
                capacity: "15 seats",
                assignedDriver: "John D.",
                status: "In Service"
            },
            {
                id: "V003",
                carNumber: "AC-9101",
                capacity: "30 seats",
                assignedDriver: "Unassigned",
                status: "Maintenance"
            }
        ];
        
        return mockVehicles;
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
    }
};

// Add update vehicle function
export const updateVehicle = async (vehicleId: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    try {
        // This is a mock implementation
        // In a real application, we would make an API call here
        console.log(`Updating vehicle ${vehicleId} with data:`, vehicleData);
        
        return {
            id: vehicleId,
            carNumber: vehicleData.carNumber || "Unknown",
            capacity: vehicleData.capacity || "0 seats",
            assignedDriver: vehicleData.assignedDriver || "Unassigned",
            status: vehicleData.status || "Available"
        };
    } catch (error) {
        console.error("Error updating vehicle:", error);
        throw error;
    }
};

// Add create vehicle function
export const createVehicle = async (vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    try {
        // This is a mock implementation
        // In a real application, we would make an API call here
        console.log(`Creating new vehicle with data:`, vehicleData);
        
        return {
            id: `V${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            ...vehicleData
        };
    } catch (error) {
        console.error("Error creating vehicle:", error);
        throw error;
    }
};

// Add delete vehicle function
export const deleteVehicle = async (vehicleId: string): Promise<void> => {
    try {
        // This is a mock implementation
        // In a real application, we would make an API call here
        console.log(`Deleting vehicle with ID: ${vehicleId}`);
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        throw error;
    }
};
