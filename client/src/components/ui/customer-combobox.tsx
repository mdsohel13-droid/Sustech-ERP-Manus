"use client";

import * as React from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Customer {
  id: number;
  name: string;
  company?: string;
  email?: string;
}

interface CustomerComboboxProps {
  customers: Customer[];
  value: string;
  onValueChange: (value: string, isWalkIn: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function CustomerCombobox({
  customers,
  value,
  onValueChange,
  placeholder = "Select customer...",
  className,
}: CustomerComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [walkInName, setWalkInName] = React.useState("");

  const isWalkIn = value.startsWith("walkin:");
  const walkInDisplayName = isWalkIn ? value.replace("walkin:", "") : "";
  const selectedCustomer = !isWalkIn ? customers.find((c) => String(c.id) === value) : null;

  const displayValue = isWalkIn 
    ? `Walk-in: ${walkInDisplayName}` 
    : selectedCustomer 
      ? selectedCustomer.name 
      : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          {displayValue}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search customers or type walk-in name..." 
            value={walkInName}
            onValueChange={setWalkInName}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-2">
                <p className="text-sm text-muted-foreground mb-2">No customer found.</p>
                {walkInName && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onValueChange(`walkin:${walkInName}`, true);
                      setOpen(false);
                      setWalkInName("");
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Add as walk-in: "{walkInName}"
                  </Button>
                )}
              </div>
            </CommandEmpty>
            
            <CommandGroup heading="Walk-in Customer">
              <CommandItem
                value="__walkin__"
                onSelect={() => {
                  if (walkInName) {
                    onValueChange(`walkin:${walkInName}`, true);
                    setOpen(false);
                    setWalkInName("");
                  }
                }}
              >
                <User className="mr-2 h-4 w-4" />
                {walkInName ? `Walk-in: "${walkInName}"` : "Type name above for walk-in customer"}
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Existing Customers" className="max-h-[250px] overflow-y-auto">
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={`${customer.name} ${customer.company || ""} ${customer.email || ""}`}
                  onSelect={() => {
                    onValueChange(String(customer.id), false);
                    setOpen(false);
                    setWalkInName("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === String(customer.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{customer.name}</span>
                    {customer.company && (
                      <span className="text-xs text-muted-foreground">{customer.company}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
