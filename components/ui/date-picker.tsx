"use client";

import * as React from "react";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar";
import {Popover,PopoverContent,PopoverTrigger} from "@/components/ui/popover" ;
import { Button } from "./button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps{
    value:Date | undefined;
    onChange:(date:Date) => void;
    className?:string;
    placeholder?:string;
}

export const DatePicker = ({value ,onChange,className,placeholder="select date"}:DatePickerProps) =>{
  return (
    <Popover>
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                size="lg"
                className={cn(
                    "w-full justify-start  text-left font-normal px-3",
                    !value && "text-muted-foreground",
                    className
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(data) => onChange(data as Date)}
              initialFocus
              />
              
        </PopoverContent>
    </Popover>
  )
}