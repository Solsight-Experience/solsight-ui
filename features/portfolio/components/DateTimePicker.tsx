// components/ui/DateTimePicker.tsx
"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { Calendar1, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DateTimePicker24hProps {
    date?: Date;
    setDate: (date: Date | undefined) => void;
    minDate?: Date;
    maxDate?: Date;
}

export function DateTimePicker24h({ date, setDate, minDate, maxDate }: DateTimePicker24hProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;

        const newDate = selectedDate;
        if (date) {
            newDate.setHours(date.getHours());
            newDate.setMinutes(date.getMinutes());
        } else {
            newDate.setHours(0, 0, 0, 0);
        }
        setDate(newDate);
    };

    const handleTimeChange = (type: "hour" | "minute", value: number) => {
        if (!date) {
            const now = new Date();
            now.setHours(type === "hour" ? value : 0);
            now.setMinutes(type === "minute" ? value : 0);
            now.setSeconds(0, 0);
            setDate(now);
        } else {
            const newDate = new Date(date);
            if (type === "hour") newDate.setHours(value);
            else newDate.setMinutes(value);

            // Validate against minDate and maxDate
            if (minDate && newDate < minDate) return;
            if (maxDate && newDate > maxDate) return;

            setDate(newDate);
        }
    };

    return (
        <div className="relative">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className={cn("w-full justify-start text-left text-base border border-gray-500", !date && "text-muted-foreground")}>
                        <Calendar1 className="mr-2 h-4 w-4" />
                        {date && isValid(date) ? format(date, "dd/MM/yyyy HH:mm") : <span>dd/MM/yyyy HH:mm</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            disabled={(date) => {
                                const dateOnly = new Date(date);
                                dateOnly.setHours(0, 0, 0, 0);

                                if (minDate) {
                                    const minDateOnly = new Date(minDate);
                                    minDateOnly.setHours(0, 0, 0, 0);
                                    if (dateOnly < minDateOnly) return true;
                                }

                                if (maxDate) {
                                    const maxDateOnly = new Date(maxDate);
                                    maxDateOnly.setHours(0, 0, 0, 0);
                                    if (dateOnly > maxDateOnly) return true;
                                }

                                return false;
                            }}
                            initialFocus
                        />
                        <div className="flex border-t sm:border-t-0 sm:border-l">
                            <ScrollArea className="h-64 w-16">
                                <div className="flex flex-row sm:flex-col p-2 gap-1">
                                    {hours.map((h) => {
                                        let isDisabled = false;
                                        if (date) {
                                            const testDate = new Date(date);
                                            testDate.setHours(h);
                                            if (minDate && testDate < minDate) isDisabled = true;
                                            if (maxDate && testDate > maxDate) isDisabled = true;
                                        }

                                        return (
                                            <Button
                                                key={h}
                                                size="sm"
                                                variant={date?.getHours() === h ? "default" : "ghost"}
                                                className="w-10 h-9"
                                                onClick={() => handleTimeChange("hour", h)}
                                                disabled={isDisabled}
                                            >
                                                {h.toString().padStart(2, "0")}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <ScrollBar orientation="horizontal" className="sm:hidden" />
                            </ScrollArea>

                            <ScrollArea className="h-64 w-16">
                                <div className="flex flex-row sm:flex-col p-2 gap-1">
                                    {minutes.map((m) => {
                                        let isDisabled = false;
                                        if (date) {
                                            const testDate = new Date(date);
                                            testDate.setMinutes(m);
                                            if (minDate && testDate < minDate) isDisabled = true;
                                            if (maxDate && testDate > maxDate) isDisabled = true;
                                        }

                                        return (
                                            <Button
                                                key={m}
                                                size="sm"
                                                variant={date?.getMinutes() === m ? "default" : "ghost"}
                                                className="w-10 h-9"
                                                onClick={() => handleTimeChange("minute", m)}
                                                disabled={isDisabled}
                                            >
                                                {m.toString().padStart(2, "0")}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <ScrollBar orientation="horizontal" className="sm:hidden" />
                            </ScrollArea>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            {date && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-700"
                    onClick={(e) => {
                        e.stopPropagation();
                        setDate(undefined);
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
