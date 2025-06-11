// lib/utils/validations.ts (or lib/utils/validations.js)

import { format } from "date-fns";

export const validateDepartureDate = (date: Date | undefined): string | null => {
    if (!date) {
        return "Please select a departure date.";
    }
    return null;
};

export const validateDepartureTime = (time: string): string | null => {
    if (!time) {
        return "Please enter a departure time.";
    }
    // You could add more sophisticated time format validation here if needed
    return null;
};

export const validateArrivalDate = (date: Date | undefined): string | null => {
    if (!date) {
        return "Please select an arrival date.";
    }
    return null;
};

export const validateArrivalTime = (time: string): string | null => {
    if (!time) {
        return "Please enter an arrival time.";
    }
    // You could add more sophisticated time format validation here if needed
    return null;
};

export const validatePrice = (value: string): string | null => {
    if (!value || isNaN(parseFloat(value))) {
        return "Please enter a valid price.";
    } else if (parseFloat(value) < 0) {
        return "Price cannot be negative.";
    }
    return null;
};

export const validatePassengerCount = (value: number): string | null => {
    if (isNaN(value) || value <= 0) {
        return "Please enter a valid number of seats.";
    }
    return null;
};

export const validateBusRef = (value: string): string | null => {
    if (!value) {
        return "Please enter the bus reference number.";
    }
    return null;
};

// You can also create a function to validate all fields at once if needed
export const validateTripData = (
    departureDate: Date | undefined,
    departureTime: string,
    arrivalDate: Date | undefined,
    arrivalTime: string,
    price: string,
    passengerCount: number,
    busRef: string,
    departureCity: string,
    destinationCity: string
): { [key: string]: string | null } => {
    return {
        departureDate: validateDepartureDate(departureDate),
        departureTime: validateDepartureTime(departureTime),
        arrivalDate: validateArrivalDate(arrivalDate),
        arrivalTime: validateArrivalTime(arrivalTime),
        price: validatePrice(price),
        passengerCount: validatePassengerCount(passengerCount),
        busRef: validateBusRef(busRef),
        departureCity: validateDepartureCity(departureCity, destinationCity),
        destinationCity: validateDestinationCity(departureCity, destinationCity),
    };
};

export const validateDepartureCity = (value: string, destinationCity: string): string | null => {
    if (!value) return 'Departure city is required.';
    if (value === destinationCity) return 'Departure and destination cities must be different.';
    return null;
};

export const validateDestinationCity = (value: string, departureCity: string): string | null => {
    if (!value) return 'Destination city is required.';
    if (value === departureCity) return 'Destination and departure cities must be different.';
    return null;
};
