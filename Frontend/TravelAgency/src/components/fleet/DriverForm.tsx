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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

// Define the interface for the form's internal state
export interface DriverFormFields {
  id?: string;
  firstName: string;
  lastName: string;
  sex: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  photo: File | null;
  password?: string;
}

interface DriverFormProps {
  initialData?: DriverFormFields;
  onSubmit: (data: DriverFormFields) => Promise<void> | void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  isAdd: boolean;
}

const DriverForm: React.FC<DriverFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  isAdd
}) => {
  const form = useForm<DriverFormFields>({
    defaultValues: {
      id: initialData?.id || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      sex: initialData?.sex || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      email: initialData?.email || "",
      photo: null,
      phone: initialData?.phone || "",
      password: "",
    }
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    form.reset({
      id: initialData?.id || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      sex: initialData?.sex || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      photo: null,
      password: "",
    });
  }, [initialData, form]);

  const handleSubmit = async (data: DriverFormFields) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
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
                <FormLabel>Driver ID</FormLabel>
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
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter driver's first name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter driver's last name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sex</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} placeholder="Enter driver's email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. +251-912-345678" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photo"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Driver Photo</FormLabel>
              <FormControl>
                <Input
                  {...fieldProps}
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    onChange(event.target.files && event.target.files[0] ? event.target.files[0] : null);
                  }}
                />
              </FormControl>
              {!isAdd && initialData?.photo && typeof initialData.photo === 'string' && (
                <p className="text-sm text-muted-foreground mt-1">Current photo: <a href={initialData.photo} target="_blank" rel="noopener noreferrer" className="underline">View Photo</a></p>
              )}
              {value instanceof File && <p className="text-sm text-muted-foreground mt-1">Selected: {value.name}</p>}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} placeholder="Enter password" required={isAdd} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          {isAdd ? (
            <>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#F35B04] hover:bg-[#d14e03] flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Adding..." : "Add"}
              </Button>
            </>
          ) : (
            <>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" type="button" disabled={isSubmitting}>
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the driver from the system.
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
              <Button
                type="submit"
                className="bg-[#F35B04] hover:bg-[#d14e03] flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default DriverForm;
