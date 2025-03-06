
import React, { useState } from "react";
import { Calendar, Clock, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTripModal: React.FC<AddTripModalProps> = ({ isOpen, onClose }) => {
  const [passengerCount, setPassengerCount] = useState(0);

  const handleSave = () => {
    // TODO: Implement saving trip functionality
    onClose();
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
                  className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full bg-gray-100"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Beginning Location *</label>
                <select className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full appearance-none bg-white">
                  <option value="" disabled selected>Select departure city</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Destination *</label>
                <select className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full appearance-none bg-white">
                  <option value="" disabled selected>Select arrival city</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Departure Date *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="mm/dd/yyyy" 
                    className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Frequency</label>
                <select className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full appearance-none bg-white">
                  <option value="" disabled selected>Does not repeat</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Arrival Time *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full"
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Departure Time *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full"
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Terminal</label>
                <select className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full appearance-none bg-white">
                  <option value="" disabled selected>Select starting terminal</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Price (ETB) *</label>
                <input 
                  type="text" 
                  defaultValue="0.00" 
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
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Car Number *</label>
                <select className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full appearance-none bg-white">
                  <option value="" disabled selected>Select vehicle</option>
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
                defaultValue="0" 
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
