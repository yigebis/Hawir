
import React, { useState } from "react";
import { Edit, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TravelItemProps {
  title: string;
  departureDate: string;
  id: string;
  price: string;
}

interface TravelerData {
  id: number;
  name: string;
  seat: string;
  phone: string;
  departure: string;
  bookTime: string;
  bookTimeLimit: string;
  paymentStatus: "Paid" | "Booked";
}

// Sample data for the travelers list
const sampleTravelers: TravelerData[] = [
  {
    id: 1,
    name: "John Smith",
    seat: "A1",
    phone: "+251 995004",
    departure: "New York",
    bookTime: "2024-01-20 09:30",
    bookTimeLimit: "2024-01-20 21:30",
    paymentStatus: "Paid"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    seat: "B3",
    phone: "+1 555-0124",
    departure: "Los Angeles",
    bookTime: "2024-01-20 10:15",
    bookTimeLimit: "2024-01-20 22:15",
    paymentStatus: "Booked"
  },
  {
    id: 3,
    name: "Michael Brown",
    seat: "C4",
    phone: "+1 555-0125",
    departure: "Chicago",
    bookTime: "2024-01-20 11:45",
    bookTimeLimit: "2024-01-20 23:45",
    paymentStatus: "Paid"
  },
  {
    id: 4,
    name: "Emma Davis",
    seat: "D2",
    phone: "+1 555-0126",
    departure: "Miami",
    bookTime: "2024-01-20 12:30",
    bookTimeLimit: "2024-01-21 00:30",
    paymentStatus: "Booked"
  }
];

const TravelItem: React.FC<TravelItemProps> = ({
  title,
  departureDate,
  id,
  price,
}) => {
  const [showTravelersDialog, setShowTravelersDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"All" | "Paid" | "Booked">("All");
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  
  // Handle edit trip (placeholder function)
  const handleEditTrip = () => {
    console.log("Edit trip:", id);
    // This would open an edit dialog in a real implementation
  };
  
  // Handle export to PDF (placeholder function)
  const handleExportToPDF = () => {
    console.log("Exporting traveler list to PDF...");
    // In a real implementation, this would generate and download a PDF
  };

  // Filter travelers based on search query and payment status
  const filteredTravelers = sampleTravelers.filter(traveler => {
    const matchesSearch = 
      searchQuery === "" || 
      traveler.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      traveler.departure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      traveler.phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPayment = 
      paymentFilter === "All" || 
      traveler.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesPayment;
  });
  
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between">
        <div>
          <h4 className="font-bold text-lg text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">Departure: {departureDate}</p>
          <p className="text-xs text-gray-500 mt-1">ID:{id}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Price: {price}</p>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              title="Edit"
              onClick={handleEditTrip}
            >
              <Edit className="h-4 w-4 text-gray-500" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs text-green-800 border-green-800 hover:bg-green-50"
              onClick={() => setShowTravelersDialog(true)}
            >
              <Users className="h-3 w-3 mr-1" />
              Traveler List
            </Button>
          </div>
        </div>
      </div>
      
      {/* Travelers List Dialog */}
      <Dialog open={showTravelersDialog} onOpenChange={setShowTravelersDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Back to <span className="text-[#F35B04]">Manage Travels</span>
            </DialogTitle>
          </DialogHeader>
          
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
                      <path d="M4.243 5.656L0 1.414L1.415 0L4.243 2.828L7.071 0L8.486 1.414L4.243 5.656Z" fill="black"/>
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
                          setPaymentFilter("Booked");
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
                    <path d="M15.6562 19.06C15.5221 19.06 15.3979 19.0379 15.2837 18.9938C15.1696 18.9496 15.0583 18.8729 14.95 18.7638L11.675 15.49C11.5533 15.3683 11.49 15.225 11.485 15.06C11.48 14.895 11.5433 14.7438 11.675 14.6063C11.8133 14.4679 11.9621 14.3975 12.1212 14.395C12.2812 14.3925 12.43 14.4604 12.5675 14.5988L15.0312 17.0625V6.87501C15.0312 6.69751 15.0908 6.54876 15.21 6.42876C15.3292 6.30876 15.4779 6.24918 15.6562 6.25001C15.8346 6.25084 15.9833 6.31043 16.1025 6.42876C16.2217 6.54709 16.2812 6.69584 16.2812 6.87501V17.0625L18.745 14.5988C18.8667 14.4771 19.0112 14.4133 19.1787 14.4075C19.3462 14.4017 19.4988 14.4679 19.6363 14.6063C19.7696 14.7438 19.8375 14.8913 19.84 15.0488C19.8425 15.2063 19.775 15.3533 19.6375 15.49L16.3625 18.765C16.2542 18.8733 16.1429 18.9496 16.0288 18.9938C15.9154 19.0379 15.7913 19.06 15.6562 19.06ZM8.92625 23.75C8.35042 23.75 7.87 23.5575 7.485 23.1725C7.1 22.7875 6.90708 22.3067 6.90625 21.73V19.3263C6.90625 19.1488 6.96583 19.0004 7.085 18.8813C7.20417 18.7621 7.35292 18.7021 7.53125 18.7013C7.70958 18.7004 7.85833 18.7604 7.9775 18.8813C8.09667 19.0021 8.15625 19.1504 8.15625 19.3263V21.73C8.15625 21.9225 8.23625 22.0992 8.39625 22.26C8.55625 22.4208 8.7325 22.5008 8.925 22.5H22.3875C22.5792 22.5 22.7554 22.42 22.9163 22.26C23.0771 22.1 23.1571 21.9233 23.1562 21.73V19.3263C23.1562 19.1488 23.2158 19.0004 23.335 18.8813C23.4542 18.7621 23.6029 18.7021 23.7812 18.7013C23.9596 18.7004 24.1083 18.7604 24.2275 18.8813C24.3467 19.0021 24.4062 19.1504 24.4062 19.3263V21.73C24.4062 22.3058 24.2138 22.7863 23.8288 23.1713C23.4438 23.5563 22.9629 23.7492 22.3863 23.75H8.92625Z" fill="#F35B04"/>
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
                    <TableHead className="text-[#374151] font-bold text-base">Departure</TableHead>
                    <TableHead className="text-[#374151] font-bold text-base">Book Time</TableHead>
                    <TableHead className="text-[#374151] font-bold text-base">Book Timelimit</TableHead>
                    <TableHead className="text-[#374151] font-bold text-base">Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTravelers.map((traveler) => (
                    <TableRow key={traveler.id} className="border border-[#E5E7EB]">
                      <TableCell className="p-4">{traveler.id}</TableCell>
                      <TableCell className="p-4">{traveler.name}</TableCell>
                      <TableCell className="p-4">{traveler.seat}</TableCell>
                      <TableCell className="p-4">{traveler.phone}</TableCell>
                      <TableCell className="p-4">{traveler.departure}</TableCell>
                      <TableCell className="p-4">{traveler.bookTime}</TableCell>
                      <TableCell className="p-4">{traveler.bookTimeLimit}</TableCell>
                      <TableCell className={`p-4 ${
                        traveler.paymentStatus === "Paid" 
                          ? "text-[#10B981]" 
                          : "text-[#EF4444]"
                      }`}>
                        {traveler.paymentStatus}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TravelItem;
