// src/components/tours/BookingModal.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TravelEventType } from "@/components/travels/TravelEvent"; // Use the original TravelEventType
import { format, addMinutes } from "date-fns";
import {
    createBooking,
    chooseSeat,
    Booking as BackendBookingType,
    Seat as SeatApiType,
    Payment as PaymentApiType // Import the Payment interface
} from "@/lib/api/travelService"; // Import from your travelService.ts
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Interface for the Booking form data (frontend-focused)
interface BookingFormData {
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    seat_no: number | null; // The selected seat number
    trip_type: string;
    payment_type: string;
    payment_ref_details: string; // Used for CurrentPaymentRef string
}

// Props for the BookingModal component
export interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    tour: TravelEventType; // This tour now comes from ManageTours filtered list, not extended
    onBookSuccess?: () => void;
    fetchedSeatsAvailability: boolean[]; // true = taken, false = available
    loadingSeats: boolean;
    errorSeats: string | null;
}

const BookingModal: React.FC<BookingModalProps> = ({
    isOpen,
    onClose,
    tour,
    onBookSuccess,
    fetchedSeatsAvailability,
    loadingSeats,
    errorSeats
}) => {
    const { agency, token } = useAuth();
    const agencyId = agency?.unique_id;

    const [formData, setFormData] = useState<BookingFormData>({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        seat_no: null,
        trip_type: 'One-Way',
        payment_type: 'Cash',
        payment_ref_details: '',
    });

    const [loadingBooking, setLoadingBooking] = useState(false);
    const [errorBooking, setErrorBooking] = useState<string | null>(null);

    const [bookingReceipt, setBookingReceipt] = useState<BackendBookingType | null>(null);

    const seatsForDisplay = useMemo(() => {
        const total = tour.totalSeats || 30;
        const displayArray = Array.from({ length: total }, (_, i) => ({
            number: i + 1,
            isAvailable: fetchedSeatsAvailability[i] === false,
        }));
        return displayArray;
    }, [tour.totalSeats, fetchedSeatsAvailability]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSeatSelect = useCallback((seatNumber: number, isCurrentlyAvailable: boolean) => {
        setErrorBooking(null);

        if (!isCurrentlyAvailable) {
            toast({
                title: "Seat Unavailable",
                description: "This seat is already taken. Please choose another.",
                variant: "destructive",
            });
            return;
        }

        if (formData.seat_no === seatNumber) {
            setFormData(prev => ({ ...prev, seat_no: null }));
            toast({
                title: "Seat Deselected",
                description: `Seat ${seatNumber} has been deselected.`,
                variant: "default",
            });
        } else {
            setFormData(prev => ({ ...prev, seat_no: seatNumber }));
            toast({
                title: "Seat Selected",
                description: `Seat ${seatNumber} is ready for booking.`,
                variant: "default",
            });
        }
    }, [formData.seat_no]);


    const handleBookNow = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingBooking(true);
        setErrorBooking(null);

        // Client-side validation
        if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.phone_number.trim()) {
            setErrorBooking("Please provide traveler's full name and phone number.");
            setLoadingBooking(false);
            return;
        }
        if (formData.seat_no === null) {
            setErrorBooking("Please select a seat before booking.");
            setLoadingBooking(false);
            return;
        }
        if (!agencyId || !token) {
            setErrorBooking("Authentication missing. Please log in again.");
            setLoadingBooking(false);
            return;
        }
        if (formData.payment_type !== 'Cash' && !formData.payment_ref_details.trim()) {
            setErrorBooking("Please provide payment reference details for non-cash payments.");
            setLoadingBooking(false);
            return;
        }

        try {
            // --- Step 1: Call ChooseSeat API ---
            const thirtyMinutesFromNow = addMinutes(new Date(), 30).toISOString();
            const seatPayload: SeatApiType = {
                travel_id: tour.id,
                traveler_id: agencyId, // Use agencyId as travelerId for now as discussed
                seat_no: formData.seat_no,
                max_time: thirtyMinutesFromNow,
            };
            console.log("DEBUG-BookingModal: Calling chooseSeat with payload:", seatPayload);
            await chooseSeat(seatPayload, token);
            toast({
                title: "Seat Confirmed!",
                description: `Seat ${formData.seat_no} successfully reserved. Proceeding to book...`,
                variant: "default",
            });

            // --- Step 2: If ChooseSeat is successful, proceed with CreateBooking API ---
            const currentPaymentRefValue = formData.payment_type !== 'Cash'
                ? formData.payment_ref_details.trim()
                : ""; // Use empty string for cash payments

            // Construct the Payment object
            const paymentObj: PaymentApiType = {
                current_payment_ref: currentPaymentRefValue,
                payment_successful: false, // Initial status
                failed_payment_ref: [],    // Empty array initially
            };

            // Construct the Booking payload
            const bookingPayload: BackendBookingType = {
                traveler_id: agencyId, // Keep this if backend expects it
                travel_id: tour.id,
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim(),
                phone_number: formData.phone_number.trim(),
                seat_no: formData.seat_no,
                trip_type: formData.trip_type,
                start_location: tour.start_location || '',
                destination: tour.destination || '',
                price: tour.price || 0,
                payment_type: formData.payment_type,
                payment_ref: paymentObj, // Assign the constructed Payment object
                // Omit backend-generated optional fields: id, booking_ref, book_time, pay_time, book_time_limit, status, notification_sent
            };

            console.log("DEBUG-BookingModal: Calling createBooking with payload:", bookingPayload);
            const result = await createBooking(bookingPayload, token);
            console.log('Booking successful, response:', result);

            setBookingReceipt(result);

            toast({
                title: "Booking Confirmed!",
                description: `Seat ${result.seat_no} booked for ${result.first_name} ${result.last_name}.`,
                variant: "default",
            });

        } catch (err: any) {
            console.error("Booking process failed:", err);
            setErrorBooking(err.message || "Booking failed. Please try again.");
            toast({
                title: "Booking Failed",
                description: err.message || "There was an issue processing your booking.",
                variant: "destructive",
            });
        } finally {
            setLoadingBooking(false);
        }
    };

    const closeReceiptModal = () => {
        setBookingReceipt(null);
        onClose();
        if (onBookSuccess) {
            onBookSuccess();
        }
    };

    return (
        <>
            {/* Main Booking Dialog */}
            <Dialog open={isOpen && !bookingReceipt} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[90vh] overflow-y-auto rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Book Your Trip</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Confirm details and select a seat for the trip from{" "}
                            <span className="font-semibold text-[#F35B04]">
                                {tour.start_location}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-[#F35B04]">
                                {tour.destination}
                            </span>{" "}
                            on{" "}
                            <span className="font-semibold text-[#F35B04]">
                                {tour.start ? format(new Date(tour.start), "EEEE, MMMM do,PPPP") : 'N/A'}
                            </span>
                            . Price: <span className="font-semibold text-[#F35B04]">ETB {tour.price?.toLocaleString() || 'N/A'}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleBookNow} className="grid gap-6 py-4">
                        {errorBooking && (
                            <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-200">{errorBooking}</p>
                        )}

                        {/* Traveler Information Section */}
                        <div className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
                            <h5 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">Traveler Details</h5>
                            <div>
                                <Label htmlFor="first_name" className="mb-1 block text-sm font-medium text-gray-700">
                                    First Name
                                </Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F35B04] focus:ring-[#F35B04] sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="last_name" className="mb-1 block text-sm font-medium text-gray-700">
                                    Last Name
                                </Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F35B04] focus:ring-[#F35B04] sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone_number" className="mb-1 block text-sm font-medium text-gray-700">
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone_number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F35B04] focus:ring-[#F35B04] sm:text-sm"
                                    type="tel"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                                    Email Address (Optional)
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F35B04] focus:ring-[#F35B04] sm:text-sm"
                                    type="email"
                                />
                            </div>
                        </div>

                        {/* Trip Details Section (Pre-filled from tour prop) */}
                        <div className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
                            <h5 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">Trip Summary</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-1 block text-sm font-medium text-gray-700">From</Label>
                                    <Input value={tour.start_location} readOnly className="mt-1 bg-gray-100 border-gray-200" />
                                </div>
                                <div>
                                    <Label className="mb-1 block text-sm font-medium text-gray-700">To</Label>
                                    <Input value={tour.destination} readOnly className="mt-1 bg-gray-100 border-gray-200" />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="trip_type" className="mb-1 block text-sm font-medium text-gray-700">Trip Type</Label>
                                <Select
                                    value={formData.trip_type}
                                    onValueChange={(value) => handleSelectChange("trip_type", value)}
                                >
                                    <SelectTrigger className="w-full mt-1 bg-white border-gray-300 focus:ring-[#F35B04] focus:border-[#F35B04]">
                                        <SelectValue placeholder="Select Trip Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="One-Way">One-Way</SelectItem>
                                        <SelectItem value="Round-Trip">Round-Trip</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-1 block text-sm font-medium text-gray-700">Price per seat</Label>
                                <Input value={`ETB ${tour.price?.toLocaleString() || 'N/A'}`} readOnly className="mt-1 bg-gray-100 border-gray-200" />
                            </div>
                        </div>

                        {/* Seat Selection Section */}
                        <div className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
                            <h5 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">Select Your Seat (Bus Layout)</h5>

                            {loadingSeats ? (
                                <div className="flex justify-center items-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2 text-[#F35B04]" />
                                    <span className="text-gray-600">Loading seats...</span>
                                </div>
                            ) : errorSeats ? (
                                <div className="text-center py-4 text-red-600">
                                    Error loading seats: {errorSeats}.
                                </div>
                            ) : seatsForDisplay.length === 0 ? (
                                <div className="text-center py-4 text-gray-600">
                                    No seat layout available for this trip.
                                </div>
                            ) : (
                                <div className="grid grid-cols-5 md:grid-cols-6 gap-2 p-4 border rounded-md bg-gray-50 max-h-[250px] overflow-y-auto">
                                    {seatsForDisplay.map((seat) => (
                                        <Button
                                            key={seat.number}
                                            type="button"
                                            onClick={() => handleSeatSelect(seat.number, seat.isAvailable)}
                                            className={`
                                            w-12 h-12 rounded-md font-bold text-lg flex items-center justify-center
                                            ${!seat.isAvailable ? 'bg-gray-400 text-gray-200 cursor-not-allowed' :
                                                    formData.seat_no === seat.number ? 'bg-[#F35B04] text-white hover:bg-[#F35B04]/90' :
                                                        'bg-white text-gray-700 hover:bg-gray-100'
                                                }
                                        `}
                                            disabled={!seat.isAvailable || loadingBooking}
                                        >
                                            {seat.number}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {errorBooking && errorBooking.includes("seat") && (
                                <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-200">{errorBooking}</p>
                            )}
                            {formData.seat_no && (
                                <p className="text-sm text-gray-600 mt-2">Selected Seat: <span className="font-semibold text-[#F35B04]">{formData.seat_no}</span></p>
                            )}
                        </div>

                        {/* Payment Details Section */}
                        <div className="space-y-4 p-4 border rounded-md bg-white shadow-sm">
                            <h5 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">Payment Details</h5>
                            <div>
                                <Label htmlFor="payment_type" className="mb-1 block text-sm font-medium text-gray-700">Payment Type</Label>
                                <Select
                                    value={formData.payment_type}
                                    onValueChange={(value) => handleSelectChange("payment_type", value)}
                                >
                                    <SelectTrigger className="w-full mt-1 bg-white border-gray-300 focus:ring-[#F35B04] focus:border-[#F35B04]">
                                        <SelectValue placeholder="Select Payment Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Card">Card</SelectItem>
                                        <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.payment_type !== 'Cash' && (
                                <div>
                                    <Label htmlFor="payment_ref_details" className="mb-1 block text-sm font-medium text-gray-700">
                                        Payment Reference / Transaction ID
                                    </Label>
                                    <Input
                                        id="payment_ref_details"
                                        name="payment_ref_details"
                                        value={formData.payment_ref_details}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F35B04] focus:ring-[#F35B04] sm:text-sm"
                                        placeholder="Enter transaction ID or reference"
                                        required
                                    />
                                </div>
                            )}
                            {formData.payment_type === 'Cash' && (
                                <p className="text-sm text-gray-500">No payment reference needed for cash payments.</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-[#F35B04] hover:bg-[#F35B04]/90 py-3 text-lg font-semibold rounded-md"
                            disabled={loadingBooking || loadingSeats || formData.seat_no === null}
                        >
                            {loadingBooking ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Confirm Booking"
                            )}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Booking Receipt Dialog (conditionally rendered) */}
            {bookingReceipt && (
                <Dialog open={true} onOpenChange={closeReceiptModal}>
                    <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto rounded-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-center text-[#F35B04]">Booking Confirmed!</DialogTitle>
                            <DialogDescription className="text-center text-gray-600">
                                Your trip has been successfully booked. Here are your details:
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 px-2 space-y-3 text-gray-700 text-sm">
                            <p><strong>Booking Reference:</strong> <span className="font-semibold text-gray-800">{bookingReceipt.booking_ref || 'N/A'}</span></p>
                            <p><strong>Travel ID:</strong> <span className="font-semibold text-gray-800">{bookingReceipt.travel_id || 'N/A'}</span></p>
                            <p><strong>Traveler:</strong> <span className="font-semibold text-gray-800">{bookingReceipt.first_name} {bookingReceipt.last_name}</span></p>
                            <p><strong>Phone:</strong> <span className="font-semibold text-gray-800">{bookingReceipt.phone_number}</span></p>
                            {bookingReceipt.email && <p><strong>Email:</strong> <span className="font-semibold text-gray-800">{bookingReceipt.email}</span></p>}
                            <p><strong>Seat Number:</strong> <span className="font-semibold text-gray-800">{bookingReceipt.seat_no}</span></p>
                            <p><strong>Route:</strong> <span className="font-semibold text-gray-800">{bookingReceipt.start_location} to {bookingReceipt.destination}</span></p>
                            <p><strong>Price:</strong> <span className="font-semibold text-gray-800">ETB {bookingReceipt.price?.toLocaleString() || 'N/A'}</span></p>
                            <p><strong>Payment Type:</strong> <span className="font-semibold text-gray-800">{bookingReceipt.payment_type || 'N/A'}</span></p>
                            <p><strong>Payment Reference:</strong> <span className="font-semibold text-gray-800">{bookingReceipt.payment_ref?.current_payment_ref || 'None provided'}</span></p>
                            <p><strong>Booking Time:</strong> <span className="font-semibold text-gray-800">{bookingReceipt.book_time ? format(new Date(bookingReceipt.book_time), "MMM do, yyyy HH:mm") : 'N/A'}</span></p>
                            <p className="text-center mt-4 text-green-700 font-medium">Thank you for your booking!</p>
                        </div>
                        <DialogFooter className="flex justify-center sm:justify-center p-4">
                            <Button onClick={closeReceiptModal} className="bg-[#F35B04] hover:bg-[#F35B04]/90">
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default BookingModal;
