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
import { format, differenceInDays } from "date-fns";
import { Driver } from "@/lib/api/driver";

// Define the props interface for OngoingTravelsTable
interface OngoingTravelsTableProps {
  tours: TravelEventType[];
  drivers: Driver[]; 
}

const OngoingTravelsTable: React.FC<OngoingTravelsTableProps> = ({ tours = [], drivers = [] }) => {
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

  return (
    <div className="rounded-lg border bg-[#F3F6FA]">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#BEE3E2]">
            <TableHead className="text-gray-700 font-medium text-center">Travel ID</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Beginning</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Destination</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Date</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Duration</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Driver</TableHead>
            <TableHead className="text-gray-700 font-medium text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tours.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No ongoing travels found.
              </TableCell>
            </TableRow>
          ) : (
            tours.map((tour) => {
              const startDate = tour.start ? new Date(tour.start) : null;
              const endDate = tour.end ? new Date(tour.end) : null;

              let duration = 'N/A';
              if (startDate && endDate && startDate <= endDate) {
                const diff = differenceInDays(endDate, startDate);
                duration = diff === 0 ? '1 day' : `${diff + 1} days`;
              } else if (startDate) {
                duration = '1 day';
              }

              return (
                <TableRow key={tour.id} className="bg-white">
                  <TableCell className="text-center">{tour.id}</TableCell>
                  <TableCell className="text-center">{tour.start_location || tour.location || 'N/A'}</TableCell>
                  <TableCell className="text-center">{tour.destination || 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    {startDate ? format(startDate, "EEEE MMMM do, yyyy") : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">{duration}</TableCell>
                  <TableCell className="text-center">{getDriverName(tour.driverId)}</TableCell> {/* <--- UPDATED */}
                  <TableCell className="text-center">
                    <button className="text-[#D97706] hover:text-amber-600">
                      Track Tour
                    </button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OngoingTravelsTable;
