
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
} from "@/components/ui/form";

interface DestinationFormProps {
  destination?: {
    id: string;
    name: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  isAdd?: boolean;
}

const DestinationForm: React.FC<DestinationFormProps> = ({
  destination,
  onSubmit,
  onCancel,
  onDelete,
  isAdd = true,
}) => {
  const form = useForm({
    defaultValues: {
      id: destination?.id || "",
      name: destination?.name || "",
    },
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter destination name" />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {!isAdd && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => destination && onDelete(destination.id)}
              >
                Delete
              </Button>
            )}
          </div>
          <Button type="submit" className="bg-[#F35B04] hover:bg-[#d14e03]">
            {isAdd ? "Save" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DestinationForm;
