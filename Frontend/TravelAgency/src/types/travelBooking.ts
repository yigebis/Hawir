export interface TravelBooking {
    traveler_name: string;
    seat_no: number;
    phone: string;
    email: string;
    payment_type: string;
    book_time: string; // Or Date if you want to parse it
    book_time_limit: string; // Or Date if you want to parse it
    pay_status: 'confirmed' | 'pending'; // Assuming these are the only possible values
}