"use client";

import * as React from "react";
import {format} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react"; 
import { Calendar } from "@/components/ui/calendar";   
import {Popover,PopoverContent,PopoverTrigger} from "@/components/ui/popover" ;
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface DatePickerProps{
    value:Date | undefined;
    onChange:(date:Date) => void;
    className?:string;
    placeholder?:string;
}

export const DatePicker = ({value ,onChange,className,placeholder="select date"}:DatePickerProps) =>{
  // Get today's date and set time to beginning of day for accurate comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
   <Popover>
  <PopoverTrigger asChild>
    <Button
      variant="outline"
      size="lg"
      className={cn(
        "w-full justify-start text-left font-normal px-3",
        !value && "text-muted-foreground",
        className
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value ? format(value, "PPP") : <span>{placeholder}</span>}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar
      mode="single"
      selected={value}
      onSelect={(date) => {
        if (date) {
          // Ensure the selected date is not in the past
          const selectedDate = new Date(date);
          selectedDate.setHours(0, 0, 0, 0);
          
          if (selectedDate >= today) {
            onChange(date);
          }
        }
      }}
      disabled={(date) => {
        // Disable all past dates
        const disabledDate = new Date(date);
        disabledDate.setHours(0, 0, 0, 0);
        return disabledDate < today;
      }}
      autoFocus
    />
  </PopoverContent>
</Popover>

  )
}