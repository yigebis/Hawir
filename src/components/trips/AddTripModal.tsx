
import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (tripData: any) => void;
}

const AddTripModal: React.FC<AddTripModalProps> = ({ isOpen, onClose, onSave }) => {
  const [passengerCount, setPassengerCount] = useState(0);
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [price, setPrice] = useState("0.00");
  const [discount, setDiscount] = useState("0");
  const [departureCity, setDepartureCity] = useState("");
  const [arrivalCity, setArrivalCity] = useState("");

  const handleSave = () => {
    if (!departureDate) {
      toast({
        title: "Missing information",
        description: "Please select a departure date",
        variant: "destructive",
      });
      return;
    }

    if (!departureTime || !arrivalTime) {
      toast({
        title: "Missing information",
        description: "Please enter departure and arrival times",
        variant: "destructive",
      });
      return;
    }

    if (!departureCity || !arrivalCity) {
      toast({
        title: "Missing information",
        description: "Please select departure and arrival cities",
        variant: "destructive",
      });
      return;
    }

    const tripData = {
      departureDate,
      departureTime,
      arrivalTime,
      departureCity,
      arrivalCity,
      price,
      discount,
      passengerCount,
    };

    if (onSave) {
      onSave(tripData);
    } else {
      onClose();
    }

    toast({
      title: "Trip saved",
      description: "Your trip has been added successfully",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-semibold text-black">Add New Trip</DialogTitle>
        </DialogHeader>
        <div className="bg-white rounded-lg">
          {/* Trip Information */}
          <div className="mb-6 pb-6 border-b border-[#E5E9F0]">
            <div className="flex items-center mb-6">
              <h2 className="text-lg font-semibold text-black">Trip Information</h2>
              <span className="text-[#F35B04] text-sm font-semibold ml-1">*Required</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Trip ID</label>
                <input
                  type="text"
                  disabled
                  value="TR-AUTO-GEN"
                  className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full bg-gray-100"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Beginning Location *</label>
                <select 
                  className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full appearance-none bg-white"
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                >
                  <option value="" disabled>Select departure city</option>
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Bahir Dar">Bahir Dar</option>
                  <option value="Gondar">Gondar</option>
                  <option value="Hawassa">Hawassa</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Destination *</label>
                <select 
                  className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full appearance-none bg-white"
                  value={arrivalCity}
                  onChange={(e) => setArrivalCity(e.target.value)}
                >
                  <option value="" disabled>Select arrival city</option>
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Bahir Dar">Bahir Dar</option>
                  <option value="Gondar">Gondar</option>
                  <option value="Hawassa">Hawassa</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Departure Date *</label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full flex items-center justify-between"
                      >
                        {departureDate ? format(departureDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
                        <CalendarIcon className="w-5 h-5 text-gray-500" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={departureDate}
                        onSelect={setDepartureDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Frequency</label>
                <select className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full appearance-none bg-white">
                  <option value="" disabled selected>Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Arrival Time *</label>
                <div className="relative">
                  <input 
                    type="time" 
                    className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Departure Time *</label>
                <div className="relative">
                  <input 
                    type="time" 
                    className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Terminal</label>
                <select className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full appearance-none bg-white">
                  <option value="" disabled selected>Select starting terminal</option>
                  <option value="terminal1">Terminal 1</option>
                  <option value="terminal2">Terminal 2</option>
                  <option value="terminal3">Terminal 3</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Price (ETB) *</label>
                <input 
                  type="text" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full"
                />
              </div>
            </div>
          </div>

          {/* Trip Status & Driver Details */}
          <div className="mb-6 pb-6 border-b border-[#E5E9F0]">
            <div className="flex items-center mb-6">
              <h2 className="text-lg font-semibold text-black">Trip Status & Driver Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Status *</label>
                <div className="h-[46px] bg-[#D9D9D9] rounded flex items-center px-3 text-base text-black">
                  🔵 Upcoming
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Driver *</label>
                <select className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full appearance-none bg-white">
                  <option value="" disabled selected>Select driver</option>
                  <option value="driver1">Abebe Kebede</option>
                  <option value="driver2">Bekele Mamo</option>
                  <option value="driver3">Chala Debebe</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Car Number *</label>
                <select className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full appearance-none bg-white">
                  <option value="" disabled selected>Select vehicle</option>
                  <option value="ET1234">ET1234</option>
                  <option value="ET5678">ET5678</option>
                  <option value="ET9012">ET9012</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Notes</label>
                <div className="h-[46px] bg-[#D9D9D9] rounded flex items-center px-3 text-base text-black">
                  VIP Service
                </div>
              </div>
            </div>
          </div>

          {/* Passenger & Bus Information */}
          <div className="mb-6 pb-6 border-b border-[#E5E9F0]">
            <div className="flex items-center mb-6">
              <h2 className="text-lg font-semibold text-black">Passenger & Bus Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Bus Type *</label>
                <select className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full appearance-none bg-white">
                  <option value="" disabled selected>Select bus type</option>
                  <option value="minibus">Minibus</option>
                  <option value="midbus">Midbus</option>
                  <option value="coaster">Coaster</option>
                  <option value="luxury">Luxury Bus</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Passenger Count</label>
                <div className="flex items-center gap-2">
                  <button 
                    className="w-10 h-10 border border-[#E5E9F0] rounded bg-white flex items-center justify-center text-base"
                    onClick={() => setPassengerCount(Math.max(0, passengerCount - 1))}
                  >
                    -
                  </button>
                  <input 
                    type="text" 
                    value={passengerCount} 
                    readOnly
                    className="w-20 h-[50px] border border-[#E5E9F0] rounded text-center"
                  />
                  <button 
                    className="w-10 h-10 border border-[#E5E9F0] rounded bg-white flex items-center justify-center text-base"
                    onClick={() => setPassengerCount(passengerCount + 1)}
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-600">/0 seats</span>
                </div>
              </div>
            </div>
          </div>

          {/* Discount */}
          <div className="mb-6 pb-6 border-b border-[#E5E9F0]">
            <div className="flex items-center mb-6">
              <h2 className="text-lg font-semibold text-black">Discount (%)</h2>
            </div>
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6">
            <button 
              className="h-[42px] px-4 border border-[#E5E9F0] rounded bg-white text-gray-600 text-base cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="h-[42px] px-6 bg-[#F35B04] border-none rounded text-white text-base cursor-pointer"
              onClick={handleSave}
            >
              Save Trip
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTripModal;
