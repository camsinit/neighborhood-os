
import React from 'react';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Sun, Coffee, Moon } from 'lucide-react';

// Available time preferences
export const timeOptions = [
  { id: "morning", label: "Morning", icon: Coffee },
  { id: "afternoon", label: "Afternoon", icon: Sun },
  { id: "evening", label: "Evening", icon: Moon },
] as const;

interface TimePreferenceSelectorProps {
  selectedPreferences: string[];
  onPreferenceChange: (timeId: string) => void;
}

/**
 * Component for selecting time preferences (morning/afternoon/evening)
 */
const TimePreferenceSelector = ({
  selectedPreferences,
  onPreferenceChange,
}: TimePreferenceSelectorProps) => {
  return (
    <div className="flex gap-2">
      <TooltipProvider>
        {timeOptions.map((option) => {
          const isSelected = selectedPreferences.includes(option.id);
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
  );
};

export default TimePreferenceSelector;
