
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp } from "lucide-react";

interface Destination {
  destination: string;
  totalTravelers: number;
}

interface PopularDestinationsTableProps {
  destinations: Destination[];
}

const PopularDestinationsTable: React.FC<PopularDestinationsTableProps> = ({
  destinations
}) => {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `${index + 1}.`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-[#F35B04]" />
          <CardTitle className="text-lg font-semibold">Top 5 Popular Destinations</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead className="text-right">Travelers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {destinations.map((destination, index) => (
              <TableRow key={destination.destination} className="hover:bg-gray-50">
                <TableCell className="font-medium text-center">
                  {getRankIcon(index)}
                </TableCell>
                <TableCell className="font-medium">
                  {destination.destination}
                </TableCell>
                <TableCell className="text-right font-semibold text-[#F35B04]">
                  {destination.totalTravelers.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PopularDestinationsTable;
