
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { X, Sun, Coffee, Moon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Interface for time slots that includes date and preferences
 */
export interface TimeSlot {
  date: Date;
  preferences: string[];
}

/**
 * Props for the TimeSlotSelector component
 */
interface TimeSlotSelectorProps {
  timeSlot: TimeSlot;
  onRemove: () => void;
  onPreferenceChange: (timeId: string) => void;
}

/**
 * Component for selecting time preferences for a specific date
 * This is used to indicate when a user is available on a specific date
 */
const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  timeSlot,
  onRemove,
  onPreferenceChange,
}) => {
  // Array of available time options
  const timeOptions = [
    { id: "morning", label: "Morning", icon: Coffee },
    { id: "afternoon", label: "Afternoon", icon: Sun },
    { id: "evening", label: "Evening", icon: Moon },
  ];

  // Format the date in a readable way
  const formattedDate = format(timeSlot.date, "EEEE, MMMM do");

  return (
    <div className="p-4 border rounded-lg bg-gray-50 relative">
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium">{formattedDate}</div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 rounded-full"
          aria-label="Remove date"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-sm text-gray-500 mb-3">
        What times work for you on this date?
      </div>
      
      <div className="flex gap-2">
        <TooltipProvider>
          {timeOptions.map((option) => {
            const isSelected = timeSlot.preferences.includes(option.id);
            const Icon = option.icon;
            return (
              <Tooltip key={option.id}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`flex-1 ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => onPreferenceChange(option.id)}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    <span>{option.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSelected ? `Remove ${option.label}` : `Add ${option.label}`}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
      
      {timeSlot.preferences.length === 0 && (
        <div className="text-red-500 text-xs mt-2">
          Please select at least one time preference
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
