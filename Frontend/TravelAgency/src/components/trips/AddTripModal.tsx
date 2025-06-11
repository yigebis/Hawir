
import React, { useState, useEffect, useContext } from "react";
import { Calendar as CalendarIcon, Check, ChevronDown, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addHours } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Destination, getAllDestinations } from "@/lib/api/destination";
import { createNewTrip, CreateTripPayload, updateTrip, UpdateTripPayload, deleteTrip } from "@/lib/api/trip";
import { AuthContext, AuthContextType, useAuth } from "@/contexts/AuthContext";
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
import {
  validateDepartureDate,
  validateDepartureTime,
  validateArrivalDate,
  validateArrivalTime,
  validatePrice,
  validatePassengerCount,
  validateBusRef,
  validateDepartureCity,
  validateDestinationCity,
} from "@/components/trips/validation";
import { Bus, getBusesByAgencyId } from "@/lib/api/vehicle";
import { Driver, getDriversByAgencyId } from "@/lib/api/driver";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@radix-ui/react-checkbox";

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
  const [selectedBusRef, setSelectedBusRef] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [driverName, setDriverName] = useState("");
  const [busType, setBusType] = useState("");
  const [terminals, setTerminals] = useState<string[]>([]); // Initialize with empty array
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [errorDestinations, setErrorDestinations] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [departureDateError, setDepartureDateError] = useState<string | null>(null);
  const [departureTimeError, setDepartureTimeError] = useState<string | null>(null);
  const [arrivalDateError, setArrivalDateError] = useState<string | null>(null);
  const [arrivalTimeError, setArrivalTimeError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [passengerCountError, setPassengerCountError] = useState<string | null>(null);
  const [busRefError, setBusRefError] = useState<string | null>(null);
  const [departureCityError, setDepartureCityError] = useState<string | null>(null);
  const [destinationCityError, setDestinationCityError] = useState<string | null>(null);
  const [terminalsError, setTerminalsError] = useState<string | null>(null);
  const { token, user, isAuthenticated } = useAuth();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [errorDrivers, setErrorDrivers] = useState<string | null>(null);

  const [buses, setBuses] = useState<Bus[]>([]);
  const [loadingBuses, setLoadingBuses] = useState(true);
  const [errorBuses, setErrorBuses] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Destinations
      setLoadingDestinations(true);
      setErrorDestinations(null);
      try {
        const destData = await getAllDestinations();
        setDestinations(destData || []);
      } catch (error: any) {
        console.error("Failed to fetch destinations:", error);
        setErrorDestinations(error.message || "Failed to load destinations");
        toast({
          title: "Error loading destinations",
          description: error.message || "Could not fetch the list of cities.",
          variant: "destructive",
        });
        setDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }

      // Fetch Drivers
      setLoadingDrivers(true);
      setErrorDrivers(null);
      try {
        const driverData = await getDriversByAgencyId(token); // Pass token to API call
        setDrivers(driverData || []);
      } catch (error: any) {
        console.error("Failed to fetch drivers:", error);
        setErrorDrivers(error.message || "Failed to load drivers");
        toast({
          title: "Error loading drivers",
          description: error.message || "Could not fetch the list of drivers.",
          variant: "destructive",
        });
        setDrivers([]);
      } finally {
        setLoadingDrivers(false);
      }

      // Fetch Buses
      setLoadingBuses(true);
      setErrorBuses(null);
      try {
        const busData = await getBusesByAgencyId(token); // Pass token to API call
        setBuses(busData || []);
      } catch (error: any) {
        console.error("Failed to fetch buses:", error);
        setErrorBuses(error.message || "Failed to load buses.");
        toast({
          title: "Error loading buses",
          description: error.message || "Could not fetch the list of buses.",
          variant: "destructive",
        });
        setBuses([]);
      } finally {
        setLoadingBuses(false);
      }
    };

    if (isAuthenticated && token) { // Only fetch if authenticated and token is available
      fetchData();
    }
  }, [isAuthenticated, token]); // Dependency on isAuthenticated and token


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
      setDepartureDateError(null);
      setDepartureTimeError(null);
      setArrivalDateError(null);
      setArrivalTimeError(null);
      setPriceError(null);
      setPassengerCountError(null);
      setBusRefError(null);
      setDepartureCityError(null);
      setDestinationCityError(null);
      setTerminalsError(null);

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
      if (tripToEdit.driverId) {
        setSelectedDriverId(tripToEdit.driverId);
        const driver = drivers.find(d => d.id === tripToEdit.driverId);
        if (driver) setDriverName(`${driver.first_name} ${driver.last_name}`);
      }
      if (tripToEdit.busRef) {
        setSelectedBusRef(tripToEdit.busRef);
      }

      // Set default frequency if not available
      setFrequency("Does not repeat");
      setBusType("Luxury");

      // Set booked seats - this would come from API in a real implementation
      setBookedSeats(Math.floor(tripToEdit.totalSeats ? tripToEdit.totalSeats * 0.7 : 0));
    }
  }, [editMode, tripToEdit, drivers, buses]);

  const handleRemoveTerminal = (terminalToRemove: string) => {
    setTerminals(terminals.filter((terminal) => terminal !== terminalToRemove));
  };

  const handleTerminalCheckboxChange = (station: string, isChecked: boolean) => {
    setTerminalsError(null);
    if (isChecked) {
      setTerminals((prev) => [...prev, station]);
    } else {
      setTerminals((prev) => prev.filter((t) => t !== station));
    }
  };

  const handleDepartureDateChange = (date) => {
    setDepartureDate(date);
    setDepartureDateError('');
    validateDateTime(date, arrivalDate, departureTime, arrivalTime);
  };

  const handleDepartureTimeChange = (e) => {
    const time = e.target.value;
    setDepartureTime(time);
    setDepartureTimeError('');
    validateDateTime(departureDate, arrivalDate, time, arrivalTime);
  };

  const handleArrivalDateChange = (date) => {
    setArrivalDate(date);
    setArrivalDateError('');
    validateDateTime(departureDate, date, departureTime, arrivalTime);
  };

  const handleArrivalTimeChange = (e) => {
    const time = e.target.value;
    setArrivalTime(time);
    setArrivalTimeError('');
    validateDateTime(departureDate, arrivalDate, departureTime, time);
  };

  const parseDateTime = (date: Date | string, time: string): Date => {
    // Format the date to a readable MM/DD/YYYY string if it's a Date object
    const dateString = typeof date === 'string'
      ? new Date(date).toLocaleDateString('en-US')
      : date.toLocaleDateString('en-US');

    // Combine date and time with AM/PM
    const dateTimeString = `${dateString} ${time}`;
    return new Date(dateTimeString);
  };

  const validateDateTime = (
    departureDate: Date | string,
    arrivalDate: Date | string,
    departureTime: string,
    arrivalTime: string
  ): string | null => {

    setDepartureDateError('');
    setDepartureTimeError('');
    setArrivalDateError('');
    setArrivalTimeError('');

    if (departureDate && arrivalDate && departureTime && arrivalTime) {
      const departureDateTime = parseDateTime(departureDate, departureTime);
      const arrivalDateTime = parseDateTime(arrivalDate, arrivalTime);

      if (arrivalDateTime <= departureDateTime) {
        setArrivalTimeError('Arrival time must be later than departure time.');
        setArrivalDateError('Arrival date cannot be earlier than departure date.');
        return 'Invalid date or time';
      }
    } else if (arrivalDate && departureDate) {
      const dep = new Date(departureDate);
      const arr = new Date(arrivalDate);
      if (arr < dep) {
        setArrivalDateError('Arrival date cannot be earlier than departure date.');
        return 'Invalid date';
      }
    }

    return null; // Return null if no errors are found
  };


  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
    setPriceError(validatePrice(e.target.value));
  };

  const handlePassengerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassengerCount(parseInt(e.target.value) || 0);
    setPassengerCountError(validatePassengerCount(parseInt(e.target.value) || 0));
  };

  const handleDriverChange = (driverId: string) => {
    setSelectedDriverId(driverId);
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      setDriverName(`${driver.first_name} ${driver.last_name}`);
    } else {
      setDriverName("");
    }
  };

  const handleBusChange = (busRefValue: string) => {
    setSelectedBusRef(busRefValue);
    setBusRefError(validateBusRef(busRefValue));

    const selectedBus = buses.find(bus => bus.plate_number === busRefValue);
    if (selectedBus && selectedBus.capacity !== undefined) { // Check if capacity exists
      setBusType(selectedBus.description);
      setPassengerCount(selectedBus.capacity);
      setPassengerCountError(null);
    } else {
      setPassengerCount(0);
    }
  };

  const handleDepartureCityChange = (value: string) => {
    setDepartureCity(value);
    setDepartureCityError(validateDepartureCity(value, destinationCity));
    // Also re-validate destination in case they become equal
    setDestinationCityError(validateDestinationCity(destinationCity, value));
  };

  const handleDestinationCityChange = (value: string) => {
    setDestinationCity(value);
    setDestinationCityError(validateDestinationCity(value, departureCity));
    // Also re-validate departure in case they become equal
    setDepartureCityError(validateDepartureCity(departureCity, value));
  };

  const handleSave = async () => {
    const departureDateError = validateDepartureDate(departureDate);
    const departureTimeError = validateDepartureTime(departureTime);
    const arrivalDateError = validateArrivalDate(arrivalDate);
    const arrivalTimeError = validateArrivalTime(arrivalTime);
    const dateTimeValidationError = validateDateTime(departureDate, arrivalDate, departureTime, arrivalTime);
    const priceError = validatePrice(price);
    const passengerCountError = validatePassengerCount(passengerCount);
    const busRefValidationError = validateBusRef(selectedBusRef);
    const departureCityValidationError = validateDepartureCity(departureCity, destinationCity);
    const destinationCityValidationError = validateDestinationCity(destinationCity, departureCity);
    const terminalsValidationError = terminals.length === 0 ? "Please select at least one terminal." : null;
    const driverSelectionError = !selectedDriverId ? "Please select a driver." : null;

    // Set errors in state
    setDepartureDateError(departureDateError);
    setDepartureTimeError(departureTimeError);
    setArrivalDateError(arrivalDateError || (dateTimeValidationError?.includes("date") ? dateTimeValidationError : ""));
    setArrivalTimeError(arrivalTimeError || (dateTimeValidationError?.includes("time") ? dateTimeValidationError : ""));
    setPriceError(priceError);
    setPassengerCountError(passengerCountError);
    setBusRefError(busRefValidationError);
    setDepartureCityError(departureCityValidationError);
    setDestinationCityError(destinationCityValidationError);
    setTerminalsError(terminalsValidationError);

    // Check validity
    const hasErrors =
      departureDateError ||
      departureTimeError ||
      arrivalDateError ||
      arrivalTimeError ||
      dateTimeValidationError ||
      priceError ||
      passengerCountError ||
      busRefValidationError ||
      departureCityValidationError ||
      destinationCityValidationError ||
      terminalsError ||
      driverSelectionError;

    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: "Please correct the highlighted fields.",
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
        agency_id: agency?.unique_id,
        start_location: departureCity,
        pickup_locations: terminals, // Adjust based on your UI for pickup locations
        destination: destinationCity,
        planned_start_time: departureDateTime.toISOString(),
        est_arrival_time: arrivalDateTime.toISOString(),
        price: parseFloat(price),
        total_seats: passengerCount,
        bus_ref: selectedBusRef,
        driver_id: selectedDriverId,
        status: "upcoming",
        bus_type: busType, // Assuming you want to send this
        discount: parseFloat(discount), // Assuming you want to send this
      };

      console.log(tripData);

      let response;
      if (editMode && tripToEdit) {
        response = await updateTrip(token, {
          ...tripData,
          id: tripToEdit.id,
        } as UpdateTripPayload);
      } else {
        response = await createNewTrip(token, tripData as CreateTripPayload);
      }

      console.log("RESPONSE: ", response);
      console.log(response.ok, "\n");

      if (response.message === "travel created successfully" || response.message === "travel edited successfully") {
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
      const response = await deleteTrip(token, tripToEdit.id);
      console.log(response, "\n");
      if (response.message === "travel cancelled successfully") {
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

  const selectedDepartureCityObj = destinations.find(d => d.name === departureCity);
  const availableStations = selectedDepartureCityObj ? selectedDepartureCityObj.stations : [];
  console.log("Statinos\n");
  console.log(availableStations);

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
                      <select
                        className={cn("h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-gray-500 w-full pr-10 appearance-none bg-white", departureCityError && "border-red-500")}
                        disabled
                      >
                        <option>Loading cities...</option>
                      </select>
                    ) : errorDestinations ? (
                      <div className="text-red-500">{errorDestinations}</div>
                    ) : (
                      <select
                        className={cn("h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full pr-10 appearance-none bg-white", departureCityError && "border-red-500")}
                        value={departureCity}
                        onChange={(e) => handleDepartureCityChange(e.target.value)}
                      >
                        <option value="" disabled>Select departure city</option>
                        {destinations && destinations.map((dest) => (
                          <option key={dest.id} value={dest.name}>{dest.name}</option>
                        ))}
                      </select>
                    )}
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                  </div>
                  {departureCityError && <p className="text-red-500 text-xs mt-1">{departureCityError}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 font-medium">Destination *</label>
                  <div className="relative">
                    {loadingDestinations ? (
                      <select
                        className={cn("h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-gray-500 w-full pr-10 appearance-none bg-white", destinationCityError && "border-red-500")}
                        disabled
                      >
                        <option>Loading cities...</option>
                      </select>
                    ) : errorDestinations ? (
                      <div className="text-red-500">{errorDestinations}</div>
                    ) : (
                      <select
                        className={cn("h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full pr-10 appearance-none bg-white", destinationCityError && "border-red-500")}
                        value={destinationCity}
                        onChange={(e) => handleDestinationCityChange(e.target.value)}
                      >
                        <option value="" disabled>Select destination city</option>
                        {destinations && destinations.map((dest) => (
                          <option key={dest.id} value={dest.name}>{dest.name}</option>
                        ))}
                      </select>
                    )}
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                  </div>
                  {destinationCityError && <p className="text-red-500 text-xs mt-1">{destinationCityError}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 font-medium">Departure Date & Time *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className={cn(
                              "h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full flex items-center justify-between",
                              departureDateError && "border-red-500"
                            )}
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
                            onSelect={handleDepartureDateChange}
                            initialFocus
                            className={cn("p-3")}
                          />
                        </PopoverContent>
                      </Popover>
                      {departureDateError && <p className="text-red-500 text-xs mt-1">{departureDateError}</p>}
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="time"
                        className={cn(
                          "h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full",
                          departureTimeError && "border-red-500"
                        )}
                        value={departureTime}
                        onChange={handleDepartureTimeChange}
                      />
                      {departureTimeError && <p className="text-red-500 text-xs mt-1">{departureTimeError}</p>}
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
                            className={cn(
                              "h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full flex items-center justify-between",
                              arrivalDateError && "border-red-500"
                            )}
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
                            onSelect={handleArrivalDateChange}
                            initialFocus
                            className={cn("p-3")}
                          />
                        </PopoverContent>
                      </Popover>
                      {arrivalDateError && <p className="text-red-500 text-xs mt-1">{arrivalDateError}</p>}
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="time"
                        className={cn(
                          "h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full",
                          arrivalTimeError && "border-red-500"
                        )}
                        value={arrivalTime}
                        onChange={handleArrivalTimeChange}
                      />
                      {arrivalTimeError && <p className="text-red-500 text-xs mt-1">{arrivalTimeError}</p>}
                    </div>
                  </div>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-[#E5E9F0]">
                {/* Frequency field */}
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

                {/* Terminals field */}
                <div className="mt-6">
                  <label className="text-sm text-gray-600 font-medium">Terminals *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "h-[50px] justify-between text-left font-normal border border-[#E5E9F0] rounded w-full",
                          terminalsError && "border-red-500",
                          terminals.length === 0 && "text-muted-foreground"
                        )}
                        disabled={isSaving || !departureCity}
                      >
                        <span>
                          {terminals.length > 0
                            ? `${terminals.length} terminal(s) selected`
                            : "Select terminals"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <div className="max-h-60 overflow-y-auto">
                        {loadingDestinations ? (
                          <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading stations...
                          </div>
                        ) : errorDestinations ? (
                          <div className="p-4 text-center text-sm text-red-500">Error loading stations.</div>
                        ) : !departureCity ? (
                          <div className="p-4 text-center text-sm text-gray-500">Select a departure city first to see available terminals.</div>
                        ) : availableStations.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">No terminals found for {departureCity}.</div>
                        ) : (
                          <div className="flex flex-col p-2">
                            {availableStations.map((station, index) => (
                              <div key={index} className="flex items-center justify-between space-x-2 p-2 hover:bg-gray-50 rounded-md"> {/* ADDED justify-between */}
                                <div className="flex items-center space-x-2 flex-grow"> {/* Group checkbox and label */}
                                  <Checkbox
                                    id={`terminal-${index}`}
                                    checked={terminals.includes(station)}
                                    onCheckedChange={(checked) =>
                                      handleTerminalCheckboxChange(station, !!checked)
                                    }
                                    disabled={isSaving}
                                  />
                                  <label
                                    htmlFor={`terminal-${index}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {station}
                                  </label>
                                </div>
                                {terminals.includes(station) && ( // CONDITIONAL RENDERING OF TICK
                                  <Check className="ml-2 h-4 w-4 text-green-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {terminalsError && <p className="text-red-500 text-sm mt-1">{terminalsError}</p>}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {terminals.map((terminal, index) => (
                      <span
                        key={index}
                        className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {terminal}
                        <button
                          type="button"
                          onClick={() => handleRemoveTerminal(terminal)}
                          className="ml-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          disabled={isSaving}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>              </div>
            </div>
          </div>

          {/* Driver & Vehicle Information */}
          <div className="mb-6 pb-6 border-b border-[#E5E9F0]">
            <div className="flex items-center mb-6">
              <h2 className="text-lg font-semibold text-black">Driver & Vehicle Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Driver Name *</label>
                {/* UPDATED: Select value is now selectedDriverId, onValueChange maps to ID */}
                <Select value={selectedDriverId} onValueChange={handleDriverChange} disabled={isSaving || loadingDrivers}> {/* ADDED disabled prop */}
                  <SelectTrigger className="h-[50px] border border-[#E5E9F0] rounded px-3">
                    {loadingDrivers ? (
                      <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading drivers...</span>
                    ) : errorDrivers ? (
                      <span className="text-red-500">{errorDrivers}</span>
                    ) : drivers.length === 0 ? (
                      <span className="text-muted-foreground">No drivers available</span>
                    ) : (
                      <SelectValue placeholder="Select driver" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}> {/* Value is driver ID */}
                        {`${driver.first_name} ${driver.last_name}`} {/* Display full name */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedDriverId && <p className="text-red-500 text-sm">Please select a driver.</p>} {/* NEW: Validation message for driver */}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Bus Reference *</label>
                {/* UPDATED: Select value is now selectedBusRef, onValueChange maps to bus_ref */}
                <Select value={selectedBusRef} onValueChange={handleBusChange} disabled={isSaving || loadingBuses}> {/* ADDED disabled prop */}
                  <SelectTrigger className={cn("h-[50px] border border-[#E5E9F0] rounded px-3",
                    busRefError && "border-red-500"
                  )}>
                    {loadingBuses ? (
                      <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading buses...</span>
                    ) : errorBuses ? (
                      <span className="text-red-500">{errorBuses}</span>
                    ) : buses.length === 0 ? (
                      <span className="text-muted-foreground">No buses available</span>
                    ) : (
                      <SelectValue placeholder="Select bus reference" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.plate_number}> {/* Value is bus_ref */}
                        {bus.plate_number} {/* Display bus_ref */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {busRefError && <p className="text-red-500 text-sm">{busRefError}</p>}
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
                  onChange={(e) => handlePriceChange(e)}
                  placeholder="Enter price"
                  className={cn(
                    "h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full",
                    priceError && "border-red-500"
                  )}
                />
                {priceError && <p className="text-red-500 text-xs mt-1">{priceError}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">Total Seats *</label>
                <input
                  type="number"
                  value={passengerCount}
                  onChange={(e) => handlePassengerCountChange(e)}
                  placeholder="Enter total seats"
                  className={cn(
                    "h-[50px] border border-[#E5E9F0] rounded px-3 text-base text-black w-full",
                    passengerCountError && "border-red-500"
                  )}
                />
                {passengerCountError && <p className="text-red-500 text-xs mt-1">{passengerCountError}</p>}
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
