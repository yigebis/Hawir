
import React, { useState } from 'react';
import { Edit, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TravelBooking } from '@/types/travelBooking';
import { fetchTravelBookings } from '@/lib/api/travelService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface TravelEventType {
  id: string;
  start_location: string;
  start: Date;
  terminals: string[];
  end: Date;
  color: string;
  location?: string;
  destination?: string;
  price?: number;
  totalSeats?: number;
  busRef?: string;
  driverId?: string;
  last_mod_time?: Date;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

interface TravelEventProps {
  event: TravelEventType;
  onClick?: () => void;
  onEdit?: (event: TravelEventType) => void;
}

const TravelEvent: React.FC<TravelEventProps> = ({ event, onClick, onEdit }) => {
  const [showTravelersDialog, setShowTravelersDialog] = useState(false);
  const [travelers, setTravelers] = useState<TravelBooking[] | null>(null);
  const [loadingTravelers, setLoadingTravelers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"All" | "Paid" | "Pending">("All");
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateAndTimeLocal = (isoDateString: string) => {
    try {
      const date = parseISO(isoDateString);
      return format(date, "yyyy-MM-dd h:mm a"); // Includes date and time
    } catch (error) {
      console.error("Error parsing date:", error);
      return "Invalid Date";
    }
  };

  const handleEditTrip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(event);
    }
  };

  const handleShowTravelers = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTravelersDialog(true);
    setLoadingTravelers(true);
    setError(null);
    
    try {
      const bookings = await fetchTravelBookings(event.id);
      setTravelers(bookings || []); // Ensure we always set an array, even if the API returns null
    } catch (error: any) {
      console.error("Error fetching travelers:", error);
      setError(error.message || "Error loading traveler data");
      setTravelers([]); // Set empty array on error
    } finally {
      setLoadingTravelers(false);
    }
  };

  const handleCloseTravelersDialog = () => {
    setShowTravelersDialog(false);
    setTravelers(null); // Reset to null when closing
    setSearchQuery("");
    setPaymentFilter("All");
    setError(null);
  };

  const handleExportToPDF = () => {
    if (!travelers || travelers.length === 0) {
      return; // Don't try to export if no data
    }
    
    console.log("clicked export to pdf");
    const doc = new jsPDF();
    const title = `Travelers for ${event.start_location} -> ${event.destination}`;
    doc.setFontSize(18);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });

    const tableColumn = ["No.", "Traveler Name", "Seat", "Phone", "Email", "Book Time", "Book Timelimit", "Payment Status"];
    const tableRows: string[][] = [];

    if (filteredTravelers && filteredTravelers.length > 0) {
      filteredTravelers.forEach((traveler, index) => {
        const rowData = [
          (index + 1).toString(),
          traveler.traveler_name,
          traveler.seat_no.toString(),
          traveler.phone,
          traveler.email,
          formatDateAndTimeLocal(traveler.book_time),
          formatDateAndTimeLocal(traveler.book_time_limit),
          traveler.pay_status,
        ];
        tableRows.push(rowData);
      });
    }

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save(`travelers_${(event.start_location + ' TO ' + event.destination).replace(/\s+/g, '_')}.pdf`);
  };

  // Filter travelers based on search query and payment status
  const filteredTravelers = travelers ? travelers.filter(traveler => {
    const matchesSearch =
      searchQuery === "" ||
      traveler.traveler_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      traveler.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      traveler.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPayment =
      paymentFilter === "All" ||
      traveler.pay_status === paymentFilter;

    return matchesSearch && matchesPayment;
  }) : [];

  // Get color based on status
  const getStatusColor = () => {
    if (event.status) {
      switch (event.status) {
        case 'ongoing': return 'bg-green-500';
        case 'upcoming': return 'bg-blue-500';
        case 'completed': return 'bg-orange-500';
        default: return `bg-${event.color}-500`;
      }
    }
    return `bg-${event.color}-500`;
  };

  return (
    <>
      <div
        className="p-2 border rounded-md cursor-pointer hover:bg-gray-50"
        onClick={onClick}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor()}`}></div>
              <span className="font-medium">{`${event.start_location} -> ${event.destination}`}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {format(event.start, "h:mm a")}
              {event.end ? ` - ${format(event.end, "h:mm a")}` : ""}
            </div>
            {event.location && (
              <div className="text-xs text-gray-500 mt-0.5">
                {event.location}
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 ml-auto"
              onClick={handleEditTrip}
              title="Edit trip"
            >
              <Edit className="h-3.5 w-3.5 text-gray-500" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-1.5 text-xs text-green-800 border-green-800 hover:bg-green-50"
              onClick={handleShowTravelers}
              title="View travelers"
            >
              <Users className="h-3 w-3 mr-1" />
              <span className="hidden md:inline">Travelers</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Travelers List Dialog */}
      <Dialog
        open={showTravelersDialog}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseTravelersDialog();
          } else {
            setShowTravelersDialog(open);
          }
        }}
      >
        <DialogContent className="max-w-[90vw] md:max-w-[80vw] w-auto max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Back to <span className="text-[#F35B04]">Manage Travels</span>
            </DialogTitle>
            <DialogDescription>
              View and manage traveler information for this trip
            </DialogDescription>
          </DialogHeader>

          {loadingTravelers ? (
            <div className="flex justify-center items-center py-6">
              <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0c-4.42 0-8 3.58-8 8z"></path>
              </svg>
              <span className="ml-2">Loading travelers...</span>
            </div>
          ) : error ? (
            <div className="py-6 text-center text-red-600">
              {error}
            </div>
          ) : travelers && travelers.length === 0 ? (
            <div className="py-6 text-center text-gray-600">
              There are no travelers booked for this trip yet.
            </div>
          ) : travelers ? (
            <div className="bg-[#F3F6FA] rounded-lg shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search by name, departure, or phone..."
                  className="flex-1 h-10 rounded-lg border border-gray-400 bg-white px-4 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className="flex gap-4">
                  <div className="relative w-40">
                    <div
                      className="bg-white rounded-lg p-2 flex items-center justify-between cursor-pointer"
                      onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                    >
                      <span>{paymentFilter} Payments</span>
                      <svg width="9" height="6" viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.243 5.656L0 1.414L1.415 0L4.243 2.828L7.071 0L8.486 1.414L4.243 5.656Z" fill="black" />
                      </svg>
                    </div>

                    {showPaymentDropdown && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setPaymentFilter("All");
                            setShowPaymentDropdown(false);
                          }}
                        >
                          All Payments
                        </div>
                        <div
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setPaymentFilter("Paid");
                            setShowPaymentDropdown(false);
                          }}
                        >
                          Paid
                        </div>
                        <div
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setPaymentFilter("Pending");
                            setShowPaymentDropdown(false);
                          }}
                        >
                          Booked
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-2 text-[#F35B04] cursor-pointer"
                    onClick={handleExportToPDF}
                  >
                    <svg width="30" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.6562 19.06C15.5221 19.06 15.3979 19.0379 15.2837 18.9938C15.1696 18.9496 15.0583 18.8729 14.95 18.7638L11.675 15.49C11.5533 15.3683 11.49 15.225 11.485 15.06C11.48 14.895 11.5433 14.7438 11.675 14.6063C11.8133 14.4679 11.9621 14.3975 12.1212 14.395C12.2812 14.3925 12.43 14.4604 12.5675 14.5988L15.0312 17.0625V6.87501C15.0312 6.69751 15.0908 6.54876 15.21 6.42876C15.3292 6.30876 15.4779 6.24918 15.6562 6.25001C15.8346 6.25084 15.9833 6.31043 16.1025 6.42876C16.2217 6.54709 16.2812 6.69584 16.2812 6.87501V17.0625L18.745 14.5988C18.8667 14.4771 19.0112 14.4133 19.1787 14.4075C19.3462 14.4017 19.4988 14.4679 19.6363 14.6063C19.7696 14.7438 19.8375 14.8913 19.84 15.0488C19.8425 15.2063 19.775 15.3533 19.6375 15.49L16.3625 18.765C16.2542 18.8733 16.1429 18.9496 16.0288 18.9938C15.9154 19.0379 15.7913 19.06 15.6562 19.06ZM8.92625 23.75C8.35042 23.75 7.87 23.5575 7.485 23.1725C7.1 22.7875 6.90708 22.3067 6.90625 21.73V19.3263C6.90625 19.1488 6.96583 19.0004 7.085 18.8813C7.20417 18.7621 7.35292 18.7021 7.53125 18.7013C7.70958 18.7004 7.85833 18.7604 7.9775 18.8813C8.09667 19.0021 8.15625 19.1504 8.15625 19.3263V21.73C8.15625 21.9225 8.23625 22.0992 8.39625 22.26C8.55625 22.4208 8.7325 22.5008 8.925 22.5H22.3875C22.5792 22.5 22.7554 22.42 22.9163 22.26C23.0771 22.1 23.1571 21.9233 23.1562 21.73V19.3263C23.1562 19.1488 23.2158 19.0004 23.335 18.8813C23.4542 18.7621 23.6029 18.7021 23.7812 18.7013C23.9596 18.7004 24.1083 18.7604 24.2275 18.8813C24.3467 19.0021 24.4062 19.1504 24.4062 19.3263V21.73C24.4062 22.3058 24.2138 22.7863 23.8288 23.1713C23.4438 23.5563 22.9629 23.7492 22.3863 23.75H8.92625Z" fill="#F35B04" />
                    </svg>
                    <span>Export to PDF</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border border-[#E5E7EB]">
                      <TableHead className="text-[#374151] font-bold text-base">No</TableHead>
                      <TableHead className="text-[#374151] font-bold text-base">Traveler Name</TableHead>
                      <TableHead className="text-[#374151] font-bold text-base">Seat</TableHead>
                      <TableHead className="text-[#374151] font-bold text-base">Phone</TableHead>
                      <TableHead className="text-[#374151] font-bold text-base">Email</TableHead>
                      <TableHead className="text-[#374151] font-bold text-base">Book Time</TableHead>
                      <TableHead className="text-[#374151] font-bold text-base">Book Timelimit</TableHead>
                      <TableHead className="text-[#374151] font-bold text-base">Payment Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTravelers.map((traveler, index) => (
                      <TableRow key={index} className="border border-[#E5E7EB]">
                        <TableCell className="p-4">{index + 1}</TableCell>
                        <TableCell className="p-4">{traveler.traveler_name}</TableCell>
                        <TableCell className="p-4">{traveler.seat_no}</TableCell>
                        <TableCell className="p-4">{traveler.phone}</TableCell>
                        <TableCell className="p-4">{traveler.email}</TableCell>
                        <TableCell className="p-4">{formatDateAndTimeLocal(traveler.book_time)}</TableCell>
                        <TableCell className="p-4">{formatDateAndTimeLocal(traveler.book_time_limit)}</TableCell>
                        <TableCell className={`p-4 ${traveler.pay_status === "Paid"
                          ? "text-[#10B981]"
                          : "text-[#EF4444]"
                          }`}>
                          {traveler.pay_status}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-gray-600">
              Unable to load traveler data. Please try again.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TravelEvent;
