
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

interface VehicleFormProps {
  vehicle?: {
    id: string;
    carNumber: string;
    capacity: string;
    assignedDriver: string;
    status: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  isAdd: boolean;
  availableDrivers?: string[];
}

const VehicleForm: React.FC<VehicleFormProps> = ({ 
  vehicle, 
  onSubmit, 
  onCancel, 
  onDelete,
  isAdd,
  availableDrivers = ["Alex T.", "John D.", "Unassigned"]
}) => {
  const form = useForm({
    defaultValues: {
      id: vehicle?.id || "",
      carNumber: vehicle?.carNumber || "",
      capacity: vehicle?.capacity || "",
      assignedDriver: vehicle?.assignedDriver || "Unassigned",
      status: vehicle?.status || "Available"
    }
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const handleDelete = () => {
    if (onDelete && vehicle) {
      onDelete(vehicle.id);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        {!isAdd && (
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle ID</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="carNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Car Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. AA-1234" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. 50 seats" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="assignedDriver"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Driver</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableDrivers.map((driver) => (
                    <SelectItem key={driver} value={driver}>
                      {driver}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="In Service">In Service</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between pt-4">
          {isAdd ? (
            <>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#F35B04] hover:bg-[#d14e03]">
                Add
              </Button>
            </>
          ) : (
            <>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" type="button">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the vehicle from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <Button type="submit" className="bg-[#F35B04] hover:bg-[#d14e03]">
                Save Changes
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default VehicleForm;
