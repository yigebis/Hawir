
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Plus } from "lucide-react";

interface Terminal {
  id: string;
  name: string;
}

interface DestinationFormProps {
  destination?: {
    id: string;
    name: string;
    terminals: string[];
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
  const [terminals, setTerminals] = useState<Terminal[]>([
    { id: "1", name: "Terminal A" },
    { id: "2", name: "Terminal B" },
    { id: "3", name: "Terminal C" },
    { id: "4", name: "Terminal D" },
  ]);
  const [showNewTerminal, setShowNewTerminal] = useState(false);
  const [newTerminalName, setNewTerminalName] = useState("");

  const form = useForm({
    defaultValues: {
      id: destination?.id || "",
      name: destination?.name || "",
      terminals: destination?.terminals || [],
    },
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const handleAddTerminal = () => {
    if (newTerminalName.trim()) {
      const newTerminal = {
        id: (terminals.length + 1).toString(),
        name: newTerminalName.trim(),
      };
      setTerminals([...terminals, newTerminal]);
      setNewTerminalName("");
      setShowNewTerminal(false);
    }
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

        <FormItem>
          <FormLabel>Departure Terminals</FormLabel>
          <div className="space-y-2 border rounded-md p-4">
            {terminals.map((terminal) => (
              <div key={terminal.id} className="flex items-center space-x-2">
                <Checkbox
                  id={terminal.id}
                  checked={form.watch("terminals").includes(terminal.name)}
                  onCheckedChange={(checked) => {
                    const currentTerminals = form.watch("terminals");
                    if (checked) {
                      form.setValue("terminals", [...currentTerminals, terminal.name]);
                    } else {
                      form.setValue("terminals", 
                        currentTerminals.filter((t: string) => t !== terminal.name)
                      );
                    }
                  }}
                />
                <label htmlFor={terminal.id}>{terminal.name}</label>
              </div>
            ))}
          </div>
        </FormItem>

        {!showNewTerminal ? (
          <Button
            type="button"
            variant="ghost"
            className="text-[#F35B04] p-0 hover:bg-transparent hover:text-[#d14e03]"
            onClick={() => setShowNewTerminal(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create New Terminal
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              value={newTerminalName}
              onChange={(e) => setNewTerminalName(e.target.value)}
              placeholder="Enter terminal name"
              className="flex-1"
            />
            <Button 
              type="button"
              variant="secondary"
              onClick={handleAddTerminal}
            >
              Add
            </Button>
          </div>
        )}

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
