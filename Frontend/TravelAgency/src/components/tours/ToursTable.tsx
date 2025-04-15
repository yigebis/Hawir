
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const tours = [
  {
    id: "TOUR003",
    beginning: "Omo Valley Explorer",
    destination: "South Omo",
    date: "Mar 10, 2024",
    duration: "6 days",
    driver: "Michael Brown",
  },
  {
    id: "TOUR004",
    beginning: "Simien Trek",
    destination: "Simien Mountains",
    date: "Mar 12, 2024",
    duration: "4 days",
    driver: "David Wilson",
  },
];

const ToursTable = () => {
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
          {tours.map((tour) => (
            <TableRow key={tour.id} className="bg-white">
              <TableCell className="text-center">{tour.id}</TableCell>
              <TableCell className="text-center">{tour.beginning}</TableCell>
              <TableCell className="text-center">{tour.destination}</TableCell>
              <TableCell className="text-center">{tour.date}</TableCell>
              <TableCell className="text-center">{tour.duration}</TableCell>
              <TableCell className="text-center">{tour.driver}</TableCell>
              <TableCell className="text-center">
                <button className="text-[#D97706] hover:text-amber-600">
                  Track Tour
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ToursTable;
