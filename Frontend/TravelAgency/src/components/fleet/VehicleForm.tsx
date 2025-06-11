// src/components/fleet/VehicleForm.tsx

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
  FormDescription, // Make sure to import FormDescription
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox"; // Import the Checkbox component

// Define the interface for the form's internal state
export interface VehicleFormFields {
  id?: string;
  plate_number: string;
  capacity: number; // Assuming capacity is a number
  description: string;
  status: string; // e.g., 'available', 'in service', 'maintenance'
  is_reserved: boolean; // Correct type for the checkbox
}

// Define the props for the VehicleForm component
interface VehicleFormProps {
  initialData?: VehicleFormFields; // For editing an existing vehicle
  onSubmit: (data: VehicleFormFields) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  isAdd: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  isAdd,
}) => {
  const form = useForm<VehicleFormFields>({
    defaultValues: {
      id: initialData?.id || "",
      plate_number: initialData?.plate_number || "",
      capacity: initialData?.capacity || 0, // Default to 0 for number type
      description: initialData?.description || "",
      status: initialData?.status || "available", // Default status
      is_reserved: initialData?.is_reserved || false, // Default to false for boolean
    },
  });

  // Effect to reset form if initialData changes
  React.useEffect(() => {
    form.reset({
      id: initialData?.id || "",
      plate_number: initialData?.plate_number || "",
      capacity: initialData?.capacity || 0,
      description: initialData?.description || "",
      status: initialData?.status || "available",
      is_reserved: initialData?.is_reserved ?? false, // Use nullish coalescing for boolean
    });
  }, [initialData, form]);

  const handleSubmit = (data: VehicleFormFields) => {
    onSubmit(data);
  };

  const handleDelete = () => {
    if (onDelete && initialData?.id) {
      onDelete(initialData.id);
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
          name="plate_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plate Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., AA-12345" />
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
                <Input
                  type="number" // Ensure input type is number
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))} // Convert to number
                  placeholder="e.g., 50"
                  min="1" // Minimum capacity
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Luxury bus, 2-level" />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in service">In Service</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem> {/* Add other statuses if needed */}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- VehicleForm: IS_RESERVED CHECKBOX FIELD (MATCHES DRIVER FORM STYLE) --- */}
        <FormField
          control={form.control}
          name="is_reserved"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Is Reserved?</FormLabel>
                <FormDescription>
                  Mark if the bus is currently reserved.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* --- END IS_RESERVED CHECKBOX FIELD --- */}

        <div className="flex justify-between pt-4">
          {isAdd ? (
            <>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#F35B04] hover:bg-[#d14e03]">
                Add Vehicle
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