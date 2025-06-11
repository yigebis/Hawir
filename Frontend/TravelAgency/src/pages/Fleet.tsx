import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, User, Bus, CheckCircle, Settings, Edit, ArrowDownAZ, ArrowUpZA } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DriverForm from "@/components/fleet/DriverForm";
import VehicleForm, { VehicleFormFields } from "@/components/fleet/VehicleForm";
import { addBus, getBusesByAgencyId, updateBus, deleteBus, Bus as BackendBusType } from "@/lib/api/vehicle"; // Alias Bus as BackendBusType to avoid conflict
import DestinationForm from "@/components/fleet/DestinationForm";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { createDriver, getDriversByAgencyId, updateDriver, deleteDriver, Driver } from "@/lib/api/driver";

// Define the shape of data that the DriverForm will submit.
// This matches the DriverFormFields interface from the updated DriverForm component.
interface DriverFormFields {
  id?: string;
  firstName: string;
  lastName: string;
  sex: string;
  dateOfBirth: string; // YYYY-MM-DD
  email: string;
  phone: string;
  photo: File | null; // File for photo upload, or null if not provided
  password?: string; // Optional for edit, required for add
  // license and vehicle are not part of backend Driver struct
  license?: string; // Kept as optional for form but not persisted
  vehicle?: string; // Kept as optional for form but not persisted
}

const initialVehicles = [
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

const Fleet: React.FC = () => {
  const { toast } = useToast();
  const { token, user } = useAuth();

  const [activeTab, setActiveTab] = useState("drivers");
  const [searchQuery, setSearchQuery] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [buses, setBuses] = useState<BackendBusType[]>([]); // State for fetched buses

  const [destinations, setDestinations] = useState([
    {
      id: "D1",
      name: "Addis Ababa",
    },
    {
      id: "D2",
      name: "Bahir Dar",
    },
    {
      id: "D3",
      name: "Hawassa",
    }
  ]);

  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [editDriverOpen, setEditDriverOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [editVehicleOpen, setEditVehicleOpen] = useState(false);
  const [addDestinationOpen, setAddDestinationOpen] = useState(false);
  const [editDestinationOpen, setEditDestinationOpen] = useState(false);
  // currentDriver will hold the data formatted for the DriverForm
  const [currentDriver, setCurrentDriver] = useState<DriverFormFields | null>(null);
  const [currentVehicle, setCurrentVehicle] = useState<BackendBusType | null>(null); // Type for current bus being edited
  const [currentDestination, setCurrentDestination] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [isLoadingBuses, setIsLoadingBuses] = useState(false);

  const stats = useMemo(() => {
    const totalVehicles = buses.length;
    const availableVehicles = buses.filter(bus => bus.status === 'available').length;
    const maintenanceVehicles = buses.filter(bus => bus.status === 'maintenance').length;
    return [
      { title: "Total Vehicles", count: totalVehicles, icon: <Bus className="w-5 h-5" /> }, // Still static, or fetch from backend
      { title: "Total Drivers", count: drivers.length, icon: <User className="w-5 h-5" /> }, // <--- DYNAMICALLY UPDATED HERE
      { title: "Available Vehicles", count: availableVehicles, icon: <CheckCircle className="w-5 h-5" /> }, // Still static
      { title: "Under Maintenance", count: maintenanceVehicles, icon: <Settings className="w-5 h-5" /> } // Still static
    ];
  }, [drivers.length]);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchDrivers = async () => {
      if (!token || !user?.agencyId) {
        setDrivers([]);
        return;
      }
      setIsLoadingDrivers(true);
      try {
        const fetchedDrivers = await getDriversByAgencyId(token);
        setDrivers(fetchedDrivers);
      } catch (error: any) {
        console.error("Failed to fetch drivers:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load drivers.",
          variant: "destructive",
        });
        setDrivers([]);
      } finally {
        setIsLoadingDrivers(false);
      }
    };

    const fetchBuses = async () => {
      if (!token || !user?.agencyId) {
        setBuses([]);
        return;
      }
      setIsLoadingBuses(true);
      try {
        const fetchedBuses = await getBusesByAgencyId(token);
        setBuses(fetchedBuses);
      } catch (error: any) {
        console.error("Failed to fetch buses:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load vehicles.",
          variant: "destructive",
        });
        setBuses([]);
      } finally {
        setIsLoadingBuses(false);
      }
    };

    fetchDrivers();
    fetchBuses();
  }, [token, user?.agencyId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredDrivers = drivers.filter(driver => {
    const query = searchQuery.toLowerCase();
    return (
      driver.id.toLowerCase().includes(query) ||
      driver.first_name.toLowerCase().includes(query) || // Use firstName from API
      driver.last_name.toLowerCase().includes(query) ||   // Use lastName from API
      driver.phone.toLowerCase().includes(query) ||
      driver.email.toLowerCase().includes(query)
    );
  });

  const filteredVehicles = buses.filter(bus => { // Filter buses, not initialVehicles
    const query = searchQuery.toLowerCase();
    return (
      bus.id.toLowerCase().includes(query) ||
      bus.plate_number.toLowerCase().includes(query) ||
      bus.status.toLowerCase().includes(query) ||
      (bus.description && bus.description.toLowerCase().includes(query)) // Check if description exists
    );
  });

  const filteredDestinations = destinations.filter(destination => {
    const query = searchQuery.toLowerCase();
    return destination.name.toLowerCase().includes(query);
  });

  const sortedVehicles = React.useMemo(() => {
    let sortableVehicles = [...filteredVehicles]; // Uses the filteredVehicles from the previous step
    if (sortConfig !== null) {
      sortableVehicles.sort((a: any, b: any) => {
        // ... existing sort logic ...
        // Ensure keys like 'plate_number', 'capacity', 'status' are used for sorting
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableVehicles;
  }, [filteredVehicles, sortConfig]); // Dependencies are correct

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // --- Driver API Interactions ---
  const handleAddDriver = async (formData: DriverFormFields) => {
    if (!token || !user?.agencyId) {
      toast({
        title: "Authentication Error",
        description: "You are not logged in or agency ID is missing. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      // --- START MODIFICATIONS FOR handleAddDriver ---
      const requestFormData = new FormData();
      requestFormData.append("first_name", formData.firstName);
      requestFormData.append("last_name", formData.lastName);
      requestFormData.append("sex", formData.sex);
      // Ensure dateOfBirth is in YYYY-MM-DD format as expected by backend
      requestFormData.append("date_of_birth", formData.dateOfBirth);

      requestFormData.append("email", formData.email);
      requestFormData.append("phone", formData.phone);
      requestFormData.append("password", formData.password || ''); // Password is required for new driver

      // Append the photo File object if it exists
      if (formData.photo) { // formData.photo is already a File | null from DriverForm
        requestFormData.append("photo", formData.photo);
      }

      // IMPORTANT: Do NOT append agency_id here. The backend extracts it from the JWT claims.
      // requestFormData.append("agency_id", user.agencyId); // <-- REMOVE THIS LINE IF PRESENT

      // Call the createDriver API with the FormData object
      // (createDriver API function in driver.ts will also need to be updated)
      const result = await createDriver(token, requestFormData); // Backend returns { message: "..." }

      setAddDriverOpen(false);
      toast({
        title: "Driver Added",
        description: result.message || "Driver has been added successfully.", // Use result.message from backend
      });

      // CRUCIAL: Re-fetch drivers to update the UI
      // because the backend only returns a message, not the full driver object.
      await getDriversByAgencyId(token).then(setDrivers);
      // --- END MODIFICATIONS FOR handleAddDriver ---

    } catch (error: any) {
      console.error("Failed to add driver:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add driver. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditDriver = async (formData: DriverFormFields) => {
    if (!token || !formData.id) {
      toast({
        title: "Error",
        description: "Authentication token or driver ID is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      // --- START MODIFICATIONS FOR handleEditDriver ---
      const requestFormData = new FormData();
      // Only append fields that are potentially updated
      requestFormData.append("id", formData.id);
      requestFormData.append("first_name", formData.firstName);
      requestFormData.append("last_name", formData.lastName);
      requestFormData.append("sex", formData.sex);
      requestFormData.append("date_of_birth", formData.dateOfBirth);

      requestFormData.append("email", formData.email);
      requestFormData.append("phone", formData.phone);

      // Only send password if it's provided (i.e., being changed)
      if (formData.password) {
        requestFormData.append("password", formData.password);
      }

      // Append the photo File object if a new one is selected
      if (formData.photo) { // formData.photo is already a File | null from DriverForm
        requestFormData.append("photo", formData.photo);
      }

      // Call the updateDriver API with the FormData object
      // (updateDriver API function in driver.ts will also need to be updated)
      const result = await updateDriver(token, formData.id, requestFormData); // Backend returns { message: "..." }

      setEditDriverOpen(false);
      toast({
        title: "Driver Updated",
        description: result.message || "Driver information has been updated.", // Use result.message from backend
      });

      // CRUCIAL: Re-fetch drivers to update the UI
      // because the backend only returns a message, not the full updated driver object.
      await getDriversByAgencyId(token).then(setDrivers);
      // --- END MODIFICATIONS FOR handleEditDriver ---

    } catch (error: any) {
      console.error("Failed to update driver:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update driver. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You are not logged in. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteDriver(token, driverId);
      setDrivers(prev => prev.filter(driver => driver.id !== driverId));
      setEditDriverOpen(false);
      toast({
        title: "Driver Deleted",
        description: "The driver has been removed from the system.",
        variant: "destructive"
      });
    } catch (error: any) {
      console.error("Failed to delete driver:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete driver. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddVehicle = async (formData: VehicleFormFields) => {
    if (!token || !user?.agencyId) {
      toast({
        title: "Authentication Error",
        description: "You are not logged in or agency ID is missing. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        plate_number: formData.plate_number,
        capacity: formData.capacity,
        description: formData.description,
        // Backend handles registration_date, agency_id, is_reserved, status, current_trip on add
      };

      const result = await addBus(token, payload); // Use the addBus API function

      setAddVehicleOpen(false);
      toast({
        title: "Vehicle Added",
        description: result.message || `Vehicle ${formData.plate_number} has been added successfully.`,
      });
      await getBusesByAgencyId(token).then(setBuses); // Re-fetch buses to update the list
    } catch (error: any) {
      console.error("Failed to add vehicle:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditVehicle = async (formData: VehicleFormFields) => {
    if (!token || !currentVehicle?.id) { // Ensure currentVehicle.id is present for editing
      toast({
        title: "Error",
        description: "Authentication token or vehicle ID is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Send only updated fields as partial payload
      const payload: Partial<BackendBusType> = {
        plate_number: formData.plate_number,
        capacity: formData.capacity,
        description: formData.description,
        status: formData.status,
        is_reserved: formData.is_reserved,
        // current_trip is not directly editable via form
      };

      const result = await updateBus(token, currentVehicle.id, payload);

      setEditVehicleOpen(false);
      toast({
        title: "Vehicle Updated",
        description: result.message || `Vehicle ${formData.plate_number}'s information has been updated.`,
      });
      await getBusesByAgencyId(token).then(setBuses); // Re-fetch buses
    } catch (error: any) {
      console.error("Failed to update vehicle:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVehicle = async (busId: string) => {
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You are not logged in. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteBus(token, busId);
      await getBusesByAgencyId(token).then(setBuses); // Re-fetch buses to update state
      setEditVehicleOpen(false);
      toast({
        title: "Vehicle Deleted",
        description: "The vehicle has been removed from the system.",
        variant: "destructive"
      });
    } catch (error: any) {
      console.error("Failed to delete vehicle:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete vehicle. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddDestination = (data: any) => {
    const newDestination = {
      id: `D${destinations.length + 1}`,
      name: data.name
    };
    setDestinations([...destinations, newDestination]);
    setAddDestinationOpen(false);
    toast({
      title: "Destination Added",
      description: `${data.name} has been added successfully.`
    });
  };

  const handleEditDestination = (data: any) => {
    setDestinations(destinations.map(destination =>
      destination.id === data.id ? { id: data.id, name: data.name } : destination
    ));
    setEditDestinationOpen(false);
    toast({
      title: "Destination Updated",
      description: `${data.name}'s information has been updated.`
    });
  };

  const handleDeleteDestination = (destinationId: string) => {
    setDestinations(destinations.filter(destination => destination.id !== destinationId));
    setEditDestinationOpen(false);
    toast({
      title: "Destination Deleted",
      description: "The destination has been removed from the system.",
      variant: "destructive"
    });
  };

  const getVehicleStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "text-green-500";
      case "In Service":
        return "text-blue-500";
      case "Maintenance":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  // Maps the API Driver object to the form's expected `DriverFormFields` format
  const openEditDriverModal = (driver: Driver) => {
    const formInitialData: DriverFormFields = {
      id: driver.id,
      firstName: driver.first_name, // Map firstName from API to firstName for form
      lastName: driver.last_name,   // Map lastName from API to lastName for form
      sex: driver.sex,
      // Date conversion: Go's time.Time is ISO 8601. You need YYYY-MM-DD for HTML date input.
      dateOfBirth: driver.date_of_birth ? new Date(driver.date_of_birth).toISOString().split('T')[0] : '',
      email: driver.email,
      phone: driver.phone,
      photo: driver.photo,
      password: '', // Never pre-fill password for editing
      // license and vehicle are not part of backend Driver struct, so we provide dummy values
      license: "N/A",
      vehicle: "Unassigned",
    };
    setCurrentDriver(formInitialData);
    setEditDriverOpen(true);
  };

  const openEditVehicleModal = (bus: BackendBusType) => {
    setCurrentVehicle(bus); // Pass the bus object directly as it should conform to initialData type
    setEditVehicleOpen(true);
  };

  const openEditDestinationModal = (destination: any) => {
    setCurrentDestination(destination);
    setEditDestinationOpen(true);
  };

  const getSortIcon = (columnName: string) => {
    if (sortConfig?.key !== columnName) {
      return null;
    }
    return sortConfig.direction === 'ascending' ?
      <ArrowDownAZ className="inline w-4 h-4 ml-1" /> :
      <ArrowUpZA className="inline w-4 h-4 ml-1" />;
  };

  return (
    <DashboardLayout showHeader={false}>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-[#F35B04] font-bold text-lg uppercase tracking-widest">
            Fleet Management
          </h1>
          <div className="relative w-60">
            <Input
              placeholder="Search fleet..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-4 pr-10 h-10 w-full border-gray-200"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => ( // This now uses the dynamically generated 'stats'
            <Card key={index} className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-3 text-gray-500 text-sm">
                  <span>{stat.title}</span>
                  <div className="text-black">{stat.icon}</div>
                </div>
                <div className="text-2xl font-bold text-gray-800">{stat.count}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="drivers"
                  className={`px-1 py-2 text-base rounded-none ${activeTab === 'drivers' ? 'border-b-2 border-[#F35B04] text-[#F35B04]' : 'text-gray-500'}`}
                >
                  Drivers
                </TabsTrigger>
                <TabsTrigger
                  value="vehicles"
                  className={`px-1 py-2 text-base rounded-none ml-8 ${activeTab === 'vehicles' ? 'border-b-2 border-[#F35B04] text-[#F35B04]' : 'text-gray-500'}`}
                >
                  Vehicles
                </TabsTrigger>
                <TabsTrigger
                  value="destination"
                  className={`px-1 py-2 text-base rounded-none ml-8 ${activeTab === 'destination' ? 'border-b-2 border-[#F35B04] text-[#F35B04]' : 'text-gray-500'}`}
                >
                  Destination
                </TabsTrigger>
              </TabsList>

              {activeTab === "drivers" && (
                <Button
                  onClick={() => setAddDriverOpen(true)}
                  className="flex items-center gap-2 bg-[#F35B04] hover:bg-[#d14e03] text-white"
                >
                  <Plus size={16} />
                  <span>Add driver</span>
                </Button>
              )}

              {activeTab === "vehicles" && (
                <Button
                  onClick={() => setAddVehicleOpen(true)}
                  className="flex items-center gap-2 bg-[#F35B04] hover:bg-[#d14e03] text-white"
                >
                  <Plus size={16} />
                  <span>Add vehicle</span>
                </Button>
              )}
            </div>

            <TabsContent value="drivers" className="mt-6 p-0">
              <div className="border border-gray-200 rounded-md overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-200">
                      {/* REPLACED: Driver ID TableHead with Photo TableHead */}
                      <TableHead className="text-gray-500 font-medium text-sm">
                        Photo
                      </TableHead>
                      {/* Ensure these match your API response fields */}
                      <TableHead className="text-gray-500 font-medium text-sm">First Name</TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm">Last Name</TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm">Phone Number</TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm">Email</TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingDrivers ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading drivers...
                        </TableCell>
                      </TableRow>
                    ) : filteredDrivers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No drivers found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDrivers.map((driver) => (
                        <TableRow key={driver.id} className="border-gray-200">
                          {/* NEW: TableCell for Driver Photo */}
                          <TableCell className="font-medium">
                            {driver.photo ? (
                              <img
                                src={typeof driver.photo === "string" ? driver.photo : driver.photo ? URL.createObjectURL(driver.photo) : ""}
                                alt={`${driver.first_name || driver.first_name}'s photo`} // Use first_name if available, fallback to firstName
                                className="h-10 w-10 rounded-full object-cover" // Tailwind for small circular avatar
                              />
                            ) : (
                              <User className="h-10 w-10 text-gray-400" /> // Placeholder icon if no photo
                            )}
                          </TableCell>
                          {/* Ensure these match your API response fields, e.g., driver.first_name */}
                          <TableCell>{driver.first_name || driver.first_name}</TableCell> {/* Use driver.first_name if available, fallback to driver.firstName */}
                          <TableCell>{driver.last_name || driver.last_name}</TableCell>  {/* Use driver.last_name if available, fallback to driver.lastName */}
                          <TableCell>{driver.phone}</TableCell>
                          <TableCell>{driver.email}</TableCell>
                          <TableCell>
                            <div className="flex gap-3">
                              <button onClick={() => openEditDriverModal(driver)}>
                                <Edit className="h-5 w-5 text-blue-600" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="vehicles" className="mt-6 p-0">
              <div className="border border-gray-200 rounded-md overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-200">
                      <TableHead
                        className="text-gray-500 font-medium text-sm cursor-pointer"
                        onClick={() => requestSort('plate_number')}
                      >
                        <div className="flex items-center gap-2">
                          Plate Number
                          {getSortIcon('plate_number')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-gray-500 font-medium text-sm cursor-pointer"
                        onClick={() => requestSort('capacity')}
                      >
                        <div className="flex items-center gap-2">
                          Capacity
                          {getSortIcon('capacity')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-gray-500 font-medium text-sm cursor-pointer"
                        onClick={() => requestSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {getSortIcon('status')}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* --- MODIFIED TABLE CONTENT FOR VEHICLES --- */}
                    {isLoadingBuses ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Loading vehicles...
                        </TableCell>
                      </TableRow>
                    ) : sortedVehicles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No vehicles found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedVehicles.map((bus) => (
                        <TableRow key={bus.id} className="border-gray-200">
                          <TableCell className="font-medium">{bus.plate_number}</TableCell>
                          <TableCell>{bus.capacity} seats</TableCell>
                          <TableCell>
                            <span className={`font-medium ${getVehicleStatusColor(bus.status)}`}>
                              {bus.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-3">
                              <button onClick={() => openEditVehicleModal(bus)}>
                                <Edit className="h-5 w-5 text-blue-600" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {/* --- END MODIFIED TABLE CONTENT FOR VEHICLES --- */}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="destination" className="mt-6 p-0">
              <div className="border border-gray-200 rounded-md">
                <Button
                  onClick={() => setAddDestinationOpen(true)}
                  className="absolute right-0 top-0 mb-4 bg-[#F35B04] hover:bg-[#d14e03] text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Destination
                </Button>
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-500 font-medium text-sm">Destination Name</TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDestinations.map((destination) => (
                      <TableRow key={destination.id} className="border-gray-200">
                        <TableCell className="font-medium">{destination.name}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-3">
                            <button onClick={() => {
                              setCurrentDestination(destination);
                              setEditDestinationOpen(true);
                            }}>
                              <Edit className="h-5 w-5 text-blue-600" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Driver Dialog */}
      <Dialog open={addDriverOpen} onOpenChange={setAddDriverOpen}>
        {/* Added overflow-y-auto and max-h-[85vh] classes */}
        <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
          </DialogHeader>
          <DriverForm
            onSubmit={handleAddDriver}
            onCancel={() => setAddDriverOpen(false)}
            isAdd={true}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={editDriverOpen} onOpenChange={setEditDriverOpen}>
        {/* Added overflow-y-auto and max-h-[85vh] classes */}
        <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
          </DialogHeader>
          {currentDriver && (
            <DriverForm
              initialData={currentDriver}
              onSubmit={handleEditDriver}
              onCancel={() => setEditDriverOpen(false)}
              onDelete={handleDeleteDriver}
              isAdd={false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Vehicle and Destination Dialogs (kept as is) */}
      <Dialog open={addVehicleOpen} onOpenChange={setAddVehicleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <VehicleForm
            onSubmit={handleAddVehicle} // Use the new handleAddVehicle
            onCancel={() => setAddVehicleOpen(false)}
            isAdd={true}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog - now uses VehicleForm (MODIFIED) */}
      <Dialog open={editVehicleOpen} onOpenChange={setEditVehicleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          {currentVehicle && (
            <VehicleForm
              initialData={currentVehicle} // Pass the BackendBusType directly
              onSubmit={handleEditVehicle}
              onCancel={() => setEditVehicleOpen(false)}
              onDelete={handleDeleteVehicle}
              isAdd={false}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addDestinationOpen} onOpenChange={setAddDestinationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Destination</DialogTitle>
          </DialogHeader>
          <DestinationForm
            onSubmit={handleAddDestination}
            onCancel={() => setAddDestinationOpen(false)}
            isAdd={true}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editDestinationOpen} onOpenChange={setEditDestinationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Destination</DialogTitle>
          </DialogHeader>
          {currentDestination && (
            <DestinationForm
              destination={currentDestination}
              onSubmit={handleEditDestination}
              onCancel={() => setEditDestinationOpen(false)}
              onDelete={handleDeleteDestination}
              isAdd={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Fleet;