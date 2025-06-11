// src/components/tours/CancelledTravelsTable.tsx
import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TravelEventType } from "@/components/travels/TravelEvent";
import { format } from "date-fns";
import { Driver } from "@/lib/api/driver";

interface CancelledTravelsTableProps {
    tours: TravelEventType[];
    drivers: Driver[]; 
}

const CancelledTravelsTable: React.FC<CancelledTravelsTableProps> = ({ tours = [], drivers = [] }) => {
    // Create a Map for quick driver lookup by ID
    const driverMap = React.useMemo(() => {
        const map = new Map<string, Driver>();
        drivers.forEach(driver => {
            map.set(driver.id, driver);
        });
        return map;
    }, [drivers]);

    // Helper function to get driver name by ID
    const getDriverName = (driverId: string | undefined): string => {
        if (!driverId) return 'N/A';
        const driver = driverMap.get(driverId);
        return driver ? `${driver.first_name} ${driver.last_name}` : 'N/A';
    };

    console.log("Tours prop received in CancelledTravelsTable:", tours);

    return (
        <div className="rounded-lg border bg-[#F3F6FA]">
            <Table>
                <TableHeader>
                    <TableRow className="bg-[#BEE3E2]">
                        <TableHead className="text-gray-700 font-medium text-center">Travel ID</TableHead>
                        <TableHead className="text-gray-700 font-medium text-center">Origin</TableHead>
                        <TableHead className="text-gray-700 font-medium text-center">Destination</TableHead>
                        <TableHead className="text-gray-700 font-medium text-center">Planned Date</TableHead>
                        <TableHead className="text-gray-700 font-medium text-center">Driver</TableHead>
                        <TableHead className="text-gray-700 font-medium text-center">Reason</TableHead> {/* Display cancellation reason */}
                        <TableHead className="text-gray-700 font-medium text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tours.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                No cancelled travels found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tours.map((tour) => (
                            <TableRow key={tour.id} className="bg-white">
                                <TableCell className="text-center">{tour.id}</TableCell>
                                <TableCell className="text-center">{tour.start_location || tour.location || 'N/A'}</TableCell>
                                <TableCell className="text-center">{tour.destination || 'N/A'}</TableCell>
                                <TableCell className="text-center">
                                    {tour.start ? format(new Date(tour.start), "EEEE MMMM do, yyyy") : 'N/A'}
                                </TableCell>
                                <TableCell className="text-center">{getDriverName(tour.driverId)}</TableCell> {/* <--- UPDATED */}
                                <TableCell className="text-center">The Trip is cancelled due to political instability!! </TableCell> {/*{tour.cancellation_reason || 'N/A'} */}
                                <TableCell className="text-center">
                                    {/* You can add actions specific to cancelled tours here, e.g., view details */}
                                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                                        View Details
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default CancelledTravelsTable;
