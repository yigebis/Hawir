
import React, { useState, useEffect, useContext } from "react";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addHours } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Destination, getAllDestinations } from "@/lib/api/destination";
import { createNewTrip, CreateTripPayload, updateTrip, UpdateTripPayload, deleteTrip } from "@/lib/api/trip";
import { AuthContext, AuthContextType } from "@/contexts/AuthContext";
import { TravelEventType } from "@/components/travels/TravelEvent";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";

// Mock data for select fields
const DRIVERS = [
  { id: "1", name: "Shiferaw Fogera" },
  { id: "2", name: "Abebe Bekele" },
  { id: "3", name: "Kebede Alemu" },
  { id: "4", name: "Meseret Tadesse" }
];

const BUS_REFERENCES = [
  { id: "1", ref: "ET-2312" },
  { id: "2", ref: "ET-4567" },
  { id: "3", ref: "ET-7890" },
  { id: "4", ref: "ET-1234" }
];

const TERMINALS = [
  { id: "1", name: "Main Terminal" },
  { id: "2", name: "Lambert" },
  { id: "3", name: "North Station" },
  { id: "4", name: "South Station" }
];

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (tripData: any) => void;
  initialDate?: Date;
  initialTime?: string;
  editMode?: boolean;
  tripToEdit?: TravelEventType;
}

const AddTripModal: React.FC<AddTripModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialTime,
  editMode = false,
  tripToEdit
}) => {
  const { agency } = useContext(AuthContext) as AuthContextType;
  const [passengerCount, setPassengerCount] = useState(0);
  const [bookedSeats, setBookedSeats] = useState(0);
  const [departureTime, setDepartureTime] = useState(initialTime || "");
  const [departureDate, setDepartureDate] = useState<Date | undefined>(initialDate || undefined);
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>(initialDate || undefined);
  const [arrivalTime, setArrivalTime] = useState(initialTime || "");
  const [frequency, setFrequency] = useState("");
  const [price, setPrice] = useState("0.00");
  const [discount, setDiscount] = useState("0");
  const [departureCity, setDepartureCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [busRef, setBusRef] = useState("");
  const [driverName, setDriverName] = useState("");
  const [busType, setBusType] = useState("");
  const [terminals, setTerminals] = useState<string[]>([]); // Initialize with empty array
  const [newTerminalInput, setNewTerminalInput] = useState(""); 
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [errorDestinations, setErrorDestinations] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch destinations on component mount
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoadingDestinations(true);
      setErrorDestinations(null);
      try {
        const data = await getAllDestinations();
        setDestinations(data || []); // Ensure data is always an array
      } catch (error: any) {
        console.error("Failed to fetch destinations:", error);
        setErrorDestinations(error.message || "Failed to load destinations");
        toast({
          title: "Error loading destinations",
          description: error.message || "Could not fetch the list of cities.",
          variant: "destructive",
        });
        setDestinations([]); // Set empty array on error
      } finally {
        setLoadingDestinations(false);
      }
    };

    fetchDestinations();
  }, []);

  // Update fields when initialDate or initialTime changes
  useEffect(() => {
    if (!editMode) {
      if (initialDate) {
        setDepartureDate(initialDate);
        setArrivalDate(initialDate); // Initialize arrival date with departure date
      }
      if (initialTime) {
        setDepartureTime(initialTime);

        // Calculate arrival time (1.5 hours after departure time)
        try {
          const [hours, minutes] = initialTime.split(':').map(Number);
          const departureDateTime = new Date();
          departureDateTime.setHours(hours, minutes);

          const arrivalDateTime = addHours(departureDateTime, 1.5);
          const arrivalTimeString = `${arrivalDateTime.getHours().toString().padStart(2, '0')}:${arrivalDateTime.getMinutes().toString().padStart(2, '0')}`;
          setArrivalTime(arrivalTimeString);
        } catch (e) {
          setArrivalTime(initialTime); // Fallback to departure time if calculation fails
        }
      }
    }
  }, [initialDate, initialTime, editMode]);

  // Populate form with trip data when in edit mode
  useEffect(() => {
    if (editMode && tripToEdit) {
      // Set departure and arrival date/time
      setTerminals(tripToEdit.terminals || []); // Ensure terminals is always an array
      setDepartureDate(tripToEdit.start);
      setArrivalDate(tripToEdit.end);

      setDepartureTime(format(tripToEdit.start, "HH:mm"));
      setArrivalTime(format(tripToEdit.end, "HH:mm"));

      // Set locations
      if (tripToEdit.location) setDepartureCity(tripToEdit.location);
      if (tripToEdit.destination) setDestinationCity(tripToEdit.destination);

      // Set price and capacity
      if (tripToEdit.price !== undefined) setPrice(tripToEdit.price.toString());
      if (tripToEdit.totalSeats !== undefined) setPassengerCount(tripToEdit.totalSeats);

      // Bus reference and driver
      if (tripToEdit.busRef) setBusRef(tripToEdit.busRef);
      if (tripToEdit.driverName) setDriverName(tripToEdit.driverName);

      // Set default frequency if not available
      setFrequency("Does not repeat");
      setBusType("Luxury");

      // Set booked seats - this would come from API in a real implementation
      setBookedSeats(Math.floor(tripToEdit.totalSeats ? tripToEdit.totalSeats * 0.7 : 0));
    }
  }, [editMode, tripToEdit]);

  const handleAddTerminal = () => {
    if (newTerminalInput && !terminals.includes(newTerminalInput)) {
      setTerminals([...terminals, newTerminalInput]);
      setNewTerminalInput("");
    } else if (newTerminalInput && terminals.includes(newTerminalInput)) {
      toast({
        title: "Duplicate Terminal",
        description: "This terminal has already been added.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTerminal = (terminalToRemove: string) => {
    setTerminals(terminals.filter((terminal) => terminal !== terminalToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTerminalInput(e.target.value);
  };

  const handleSave = async () => {
    if (!departureDate) {
      toast({
        title: "Missing information",
        description: "Please select a departure date",
        variant: "destructive",
      });
      return;
    }

    if (!departureTime) {
      toast({
        title: "Missing information",
        description: "Please enter departure time",
        variant: "destructive",
      });
      return;
    }

    if (!arrivalDate) {
      toast({
        title: "Missing information",
        description: "Please select an arrival date",
        variant: "destructive",
      });
      return;
    }

    if (!arrivalTime) {
      toast({
        title: "Missing information",
        description: "Please enter arrival time",
        variant: "destructive",
      });
      return;
    }

    if (!departureCity || !destinationCity) {
      toast({
        title: "Missing information",
        description: "Please select departure and destination cities",
        variant: "destructive",
      });
      return;
    }

    if (!busRef) {
      toast({
        title: "Missing information",
        description: "Please enter the bus reference number",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const departureDateTime = new Date(departureDate);
      const [departureHours, departureMinutes] = departureTime.split(':').map(Number);
      departureDateTime.setHours(departureHours, departureMinutes);

      const arrivalDateTime = new Date(arrivalDate);
      const [arrivalHours, arrivalMinutes] = arrivalTime.split(':').map(Number);
      arrivalDateTime.setHours(arrivalHours, arrivalMinutes);

      const tripData: { [key: string]: any } = {
        agency_id: agency?.id,
        start_location: departureCity,
        pickup_locations: terminals, // Adjust based on your UI for pickup locations
        destination: destinationCity,
        planned_start_time: departureDateTime.toISOString(),
        est_arrival_time: arrivalDateTime.toISOString(),
        price: parseFloat(price),
        total_seats: passengerCount,
        bus_ref: busRef,
        driver_name: driverName,
        status: "upcoming",
        // Add other relevant fields you want to update
        bus_type: busType, // Assuming you want to send this
        discount: parseFloat(discount), // Assuming you want to send this
        // status will be determined on the backend (unless you have UI to change it)
      };

      let response;
      if (editMode && tripToEdit) {
        response = await updateTrip({
          ...tripData,
          id: tripToEdit.id,
        } as UpdateTripPayload);
      } else {
        response = await createNewTrip(tripData as CreateTripPayload);
      }

      if (response.ok) {
        toast({
          title: `Trip ${editMode ? 'updated' : 'saved'}`,
          description: `Your trip has been ${editMode ? 'updated' : 'added'} successfully`,
        });
        onClose();
        if (onSave) {
          onSave(editMode ? { ...tripData, id: tripToEdit.id } : tripData);
        }
      } else {
        const error = await response.json();
        toast({
          title: `Error ${editMode ? 'updating' : 'saving'} trip`,
          description: error.error || `Failed to ${editMode ? 'update' : 'save'} the trip. Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(`Error ${editMode ? 'updating' : 'saving'} trip:`, error);
      toast({
        title: `Error ${editMode ? 'updating' : 'saving'} trip`,
        description: "Failed to connect to the server or an unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!tripToEdit) return;

    try {
      setIsSaving(true);
      const response = await deleteTrip(tripToEdit.id);

      if (response.ok) {
        toast({
          title: "Trip deleted",
          description: "The trip has been deleted successfully",
        });
        setShowDeleteConfirm(false);
        onClose();
        if (onSave) {
          onSave({ deleted: true, id: tripToEdit.id });
        }
      } else {
        const error = await response.json();
        toast({
          title: "Error deleting trip",
          description: error.error || "Failed to delete the trip. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Error deleting trip",
        description: "Failed to connect to the server or an unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate final price after discount
  const finalPrice = parseFloat(price) * (1 - (parseFloat(discount) / 100));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-semibold text-black">
              {editMode ? "Edit Trip" : "Add New Trip"}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {editMode ? "Edit trip information" : "Fill in the details to create a new trip."}
            </DialogDescription>
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
                  <label className="text-sm text-gray-600 font-medium">Beginning Location *</label>
                  <div className="relative">
                    {loadingDestinations ? (
                      <select className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-gray-500 w-full pr-10 appearance-none bg-white" disabled>
                        <option>Loading cities...</option>
                      </select>
                    ) : errorDestinations ? (
                      <div className="text-red-500">{errorDestinations}</div>
                    ) : (
                      <select
                        className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full pr-10 appearance-none bg-white"
                        value={departureCity}
                        onChange={(e) => setDepartureCity(e.target.value)}
                      >
                        <option value="" disabled>Select departure city</option>
                        {destinations && destinations.map((dest) => (
                          <option key={dest.id} value={dest.name}>{dest.name}</option>
                        ))}
                      </select>
                    )}
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 font-medium">Destination *</label>
                  <div className="relative">
                    {loadingDestinations ? (
                      <select className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-gray-500 w-full pr-10 appearance-none bg-white" disabled>
                        <option>Loading cities...</option>
                      </select>
                    ) : errorDestinations ? (
                      <div className="text-red-500">{errorDestinations}</div>
                    ) : (
                      <select
                        className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full pr-10 appearance-none bg-white"
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                      >
                        <option value="" disabled>Select destination city</option>
                        {destinations && destinations.map((dest) => (
                          <option key={dest.id} value={dest.name}>{dest.name}</option>
                        ))}
                      </select>
                    )}
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 font-medium">Departure Date & Time *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full flex items-center justify-between"
                            type="button"
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
                            className={cn("p-3")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="time"
                        className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 font-medium">Arrival Date & Time *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full flex items-center justify-between"
                            type="button"
                          >
                            {arrivalDate ? format(arrivalDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
                            <CalendarIcon className="w-5 h-5 text-gray-500" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={arrivalDate}
                            onSelect={setArrivalDate}
                            initialFocus
                            className={cn("p-3")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="time"
                        className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 font-medium">Frequency *</label>
                  <div className="relative">
                    <select
                      className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full pr-10 appearance-none bg-white"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                    >
                      <option value="" disabled>Select frequency</option>
                      <option value="Does not repeat">Does not repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-6 pb-6 border-b border-[#E5E9F0]">
                  <label className="text-sm text-gray-600 font-medium">Terminals</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Enter terminal and press Enter"
                      value={newTerminalInput}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTerminalInput) {
                          handleAddTerminal();
                        }
                      }}
                      className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full"
                    />
                    <button
                      type="button"
                      onClick={handleAddTerminal}
                      className="h-[50px] px-4 rounded bg-[#F35B04] text-white text-base font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {terminals && terminals.map((terminal) => (
                      <div key={terminal} className="bg-gray-200 rounded-full px-3 py-1 flex items-center gap-1 text-sm">
                        {terminal}
                        <button
                          type="button"
                          onClick={() => handleRemoveTerminal(terminal)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Driver & Vehicle Information */}
            <div className="mb-6 pb-6 border-b border-[#E5E9F0]">
              <div className="flex items-center mb-6">
                <h2 className="text-lg font-semibold text-black">Driver & Vehicle Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 font-medium">Driver Name</label>
                  <Select value={driverName} onValueChange={setDriverName}>
                    <SelectTrigger className="h-[50px] border border-[#E5E9F0] rounded px-3">
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {DRIVERS.map((driver) => (
                        <SelectItem key={driver.id} value={driver.name}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 font-medium">Bus Reference *</label>
                  <Select value={busRef} onValueChange={setBusRef}>
                    <SelectTrigger className="h-[50px] border border-[#E5E9F0] rounded px-3">
                      <SelectValue placeholder="Select bus reference" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUS_REFERENCES.map((bus) => (
                        <SelectItem key={bus.id} value={bus.ref}>
                          {bus.ref}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Pricing & Capacity Section */}
            <div className="mb-6 pb-6 border-b border-[#E5E9F0]">
              <div className="flex items-center mb-6">
                <h2 className="text-lg font-semibold text-black">Pricing & Capacity</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 font-medium">Price (ETB) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 font-medium">Total Seats *</label>
                  <input
                    type="number"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(parseInt(e.target.value) || 0)}
                    placeholder="Enter total seats"
                    className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full"
                  />
                </div>

                {editMode && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600 font-medium">Booked Seats</label>
                    <input
                      type="text"
                      value={bookedSeats}
                      readOnly
                      className="h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-gray-500 bg-gray-100 w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Status Section - Only show in edit mode */}
            {editMode && tripToEdit?.status && (
              <div className="mb-6 pb-6 border-b border-[#E5E9F0]">
                <div className="flex items-center mb-6">
                  <h2 className="text-lg font-semibold text-black">Trip Status</h2>
                </div>
                <div className="flex">
                  <div className={`px-4 py-2 rounded-md flex items-center gap-2 ${tripToEdit.status === 'ongoing' ? 'bg-green-500 text-white' :
                    tripToEdit.status === 'upcoming' ? 'bg-blue-500 text-white' :
                      'bg-orange-500 text-white'
                    }`}>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    <span className="capitalize">{tripToEdit.status}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                className="h-[42px] px-4 border border-[#E5E9F0] rounded bg-white text-gray-600 text-base cursor-pointer"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>

              {editMode && (
                <button
                  className="h-[42px] px-6 bg-[#EF4444] border-none rounded text-white text-base cursor-pointer"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSaving}
                >
                  Delete Trip
                </button>
              )}

              <button
                className="h-[42px] px-6 bg-[#F35B04] border-none rounded text-white text-base cursor-pointer"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : editMode ? 'Update Trip' : 'Save Trip'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trip
              and any associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddTripModal;
