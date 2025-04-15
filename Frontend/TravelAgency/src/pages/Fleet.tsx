import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, User, Bus, CheckCircle, Settings, Edit, Trash, ArrowDownAZ, ArrowUpZA } from "lucide-react";
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
import VehicleForm from "@/components/fleet/VehicleForm";
import DestinationForm from "@/components/fleet/DestinationForm";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const stats = [
  { title: "Total Vehicles", count: 50, icon: <Bus className="w-5 h-5" /> },
  { title: "Total Drivers", count: 25, icon: <User className="w-5 h-5" /> },
  { title: "Available Vehicles", count: 30, icon: <CheckCircle className="w-5 h-5" /> },
  { title: "Under Maintenance", count: 10, icon: <Settings className="w-5 h-5" /> }
];

const initialDrivers = [
  {
    id: "D001",
    name: "Alex T.",
    phone: "+251-912-345678",
    license: "LIC-12345",
    vehicle: "Bus #XA234",
    status: "Active"
  },
  {
    id: "D002",
    name: "John D.",
    phone: "+251-911-987654",
    license: "LIC-67890",
    vehicle: "Bus #XB567",
    status: "On Leave"
  }
];

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
  const [activeTab, setActiveTab] = useState("drivers");
  const [searchQuery, setSearchQuery] = useState("");
  const [drivers, setDrivers] = useState(initialDrivers);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [destinations, setDestinations] = useState([
    {
      id: "D1",
      name: "Addis Ababa",
      terminals: ["Terminal A", "Terminal B"]
    },
    {
      id: "D2",
      name: "Bahir Dar",
      terminals: ["Terminal C"]
    },
    {
      id: "D3",
      name: "Hawassa",
      terminals: ["Terminal A", "Terminal D"]
    }
  ]);
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [editDriverOpen, setEditDriverOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [editVehicleOpen, setEditVehicleOpen] = useState(false);
  const [addDestinationOpen, setAddDestinationOpen] = useState(false);
  const [editDestinationOpen, setEditDestinationOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<any>(null);
  const [currentVehicle, setCurrentVehicle] = useState<any>(null);
  const [currentDestination, setCurrentDestination] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredDrivers = drivers.filter(driver => {
    const query = searchQuery.toLowerCase();
    return (
      driver.id.toLowerCase().includes(query) ||
      driver.name.toLowerCase().includes(query) ||
      driver.phone.toLowerCase().includes(query) ||
      driver.license.toLowerCase().includes(query) ||
      driver.vehicle.toLowerCase().includes(query) ||
      driver.status.toLowerCase().includes(query)
    );
  });

  const filteredVehicles = vehicles.filter(vehicle => {
    const query = searchQuery.toLowerCase();
    return (
      vehicle.id.toLowerCase().includes(query) ||
      vehicle.carNumber.toLowerCase().includes(query) ||
      vehicle.capacity.toLowerCase().includes(query) ||
      vehicle.assignedDriver.toLowerCase().includes(query) ||
      vehicle.status.toLowerCase().includes(query)
    );
  });

  const filteredDestinations = destinations.filter(destination => {
    const query = searchQuery.toLowerCase();
    return destination.name.toLowerCase().includes(query);
  });

  const sortedVehicles = React.useMemo(() => {
    let sortableVehicles = [...filteredVehicles];
    if (sortConfig !== null) {
      sortableVehicles.sort((a: any, b: any) => {
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
  }, [filteredVehicles, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleAddDriver = (driverData: any) => {
    const newId = `D${String(drivers.length + 1).padStart(3, '0')}`;
    const newDriver = {
      id: newId,
      ...driverData
    };
    
    setDrivers([...drivers, newDriver]);
    setAddDriverOpen(false);
    toast({
      title: "Driver Added",
      description: `${driverData.name} has been added successfully.`
    });
  };

  const handleEditDriver = (driverData: any) => {
    setDrivers(drivers.map(driver => 
      driver.id === driverData.id ? driverData : driver
    ));
    setEditDriverOpen(false);
    toast({
      title: "Driver Updated",
      description: `${driverData.name}'s information has been updated.`
    });
  };

  const handleDeleteDriver = (driverId: string) => {
    setDrivers(drivers.filter(driver => driver.id !== driverId));
    setEditDriverOpen(false);
    toast({
      title: "Driver Deleted",
      description: "The driver has been removed from the system.",
      variant: "destructive"
    });
  };

  const handleAddVehicle = (vehicleData: any) => {
    const newId = `V${String(vehicles.length + 1).padStart(3, '0')}`;
    const newVehicle = {
      id: newId,
      ...vehicleData
    };
    
    setVehicles([...vehicles, newVehicle]);
    setAddVehicleOpen(false);
    toast({
      title: "Vehicle Added",
      description: `Vehicle ${vehicleData.carNumber} has been added successfully.`
    });
  };

  const handleEditVehicle = (vehicleData: any) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === vehicleData.id ? vehicleData : vehicle
    ));
    setEditVehicleOpen(false);
    toast({
      title: "Vehicle Updated",
      description: `Vehicle ${vehicleData.carNumber}'s information has been updated.`
    });
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
    setEditVehicleOpen(false);
    toast({
      title: "Vehicle Deleted",
      description: "The vehicle has been removed from the system.",
      variant: "destructive"
    });
  };

  const handleAddDestination = (data: any) => {
    const newDestination = {
      id: `D${destinations.length + 1}`,
      ...data
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
      destination.id === data.id ? data : destination
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

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "On Leave":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
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

  const openEditDriverModal = (driver: any) => {
    setCurrentDriver(driver);
    setEditDriverOpen(true);
  };

  const openEditVehicleModal = (vehicle: any) => {
    setCurrentVehicle(vehicle);
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
          {stats.map((stat, index) => (
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
                      <TableHead className="text-gray-500 font-medium text-sm">
                        <div className="flex items-center gap-2">
                          Driver ID
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.66667 10.6665V2.6665M4.66667 2.6665L2 5.33317M4.66667 2.6665L7.33333 5.33317M11.3333 5.33317V13.3332M11.3333 13.3332L14 10.6665M11.3333 13.3332L8.66667 10.6665" stroke="black"/>
                          </svg>
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm">Full Name</TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm">Phone Number</TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm">License Number</TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm">Assigned Vehicle</TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm">Status</TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrivers.map((driver) => (
                      <TableRow key={driver.id} className="border-gray-200">
                        <TableCell className="font-medium">{driver.id}</TableCell>
                        <TableCell>{driver.name}</TableCell>
                        <TableCell>{driver.phone}</TableCell>
                        <TableCell>{driver.license}</TableCell>
                        <TableCell>{driver.vehicle}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs text-white ${getDriverStatusColor(driver.status)}`}>
                            {driver.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-3">
                            <button onClick={() => openEditDriverModal(driver)}>
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

            <TabsContent value="vehicles" className="mt-6 p-0">
              <div className="border border-gray-200 rounded-md overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-gray-200">
                      <TableHead 
                        className="text-gray-500 font-medium text-sm cursor-pointer"
                        onClick={() => requestSort('id')}
                      >
                        <div className="flex items-center gap-2">
                          Vehicle ID
                          {getSortIcon('id')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-500 font-medium text-sm cursor-pointer"
                        onClick={() => requestSort('carNumber')}
                      >
                        <div className="flex items-center gap-2">
                          Car Number
                          {getSortIcon('carNumber')}
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
                        onClick={() => requestSort('assignedDriver')}
                      >
                        <div className="flex items-center gap-2">
                          Assigned Driver
                          {getSortIcon('assignedDriver')}
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
                    {sortedVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id} className="border-gray-200">
                        <TableCell className="font-medium">{vehicle.id}</TableCell>
                        <TableCell>{vehicle.carNumber}</TableCell>
                        <TableCell>{vehicle.capacity}</TableCell>
                        <TableCell>{vehicle.assignedDriver}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${getVehicleStatusColor(vehicle.status)}`}>
                            {vehicle.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-3">
                            <button onClick={() => openEditVehicleModal(vehicle)}>
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
                      <TableHead className="text-gray-500 font-medium text-sm">Departure Terminals</TableHead>
                      <TableHead className="text-gray-500 font-medium text-sm text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDestinations.map((destination) => (
                      <TableRow key={destination.id} className="border-gray-200">
                        <TableCell className="font-medium">{destination.name}</TableCell>
                        <TableCell>{destination.terminals.join(", ")}</TableCell>
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

      <Dialog open={addDriverOpen} onOpenChange={setAddDriverOpen}>
        <DialogContent className="sm:max-w-[425px]">
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

      <Dialog open={editDriverOpen} onOpenChange={setEditDriverOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
          </DialogHeader>
          {currentDriver && (
            <DriverForm 
              driver={currentDriver}
              onSubmit={handleEditDriver} 
              onCancel={() => setEditDriverOpen(false)}
              onDelete={handleDeleteDriver}
              isAdd={false}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addVehicleOpen} onOpenChange={setAddVehicleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <VehicleForm 
            onSubmit={handleAddVehicle} 
            onCancel={() => setAddVehicleOpen(false)} 
            isAdd={true}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editVehicleOpen} onOpenChange={setEditVehicleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          {currentVehicle && (
            <VehicleForm 
              vehicle={currentVehicle}
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
