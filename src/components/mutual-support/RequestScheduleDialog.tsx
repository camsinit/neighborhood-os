
import { useState } from "react";
// Replace DialogWrapper with UniversalDialog
import UniversalDialog from "@/components/ui/universal-dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface RequestScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (schedule: {
    days: string[];
    timePreference: string[];
  }) => void;
  displayName: string; // Add displayName prop
}

const DAYS = [
  { full: "Monday", abbr: "Mon" },
  { full: "Tuesday", abbr: "Tue" },
  { full: "Wednesday", abbr: "Wed" },
  { full: "Thursday", abbr: "Thu" },
  { full: "Friday", abbr: "Fri" },
  { full: "Saturday", abbr: "Sat" },
  { full: "Sunday", abbr: "Sun" },
];

const TIME_PREFERENCES = [
  { id: "morning", label: "Morning (8am - 12pm)" },
  { id: "day", label: "During the day (12pm - 5pm)" },
  { id: "evening", label: "Evening (5pm - 9pm)" },
];

const RequestScheduleDialog = ({
  open,
  onOpenChange,
  onConfirm,
  displayName,
}: RequestScheduleDialogProps) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timePreferences, setTimePreferences] = useState<string[]>([]);

  const handleConfirm = () => {
    onConfirm({
      days: selectedDays,
      timePreference: timePreferences,
    });
    onOpenChange(false);
  };

  return (
    // Replace DialogWrapper with UniversalDialog
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Schedule Your Request"
    >
      <div className="space-y-6">
        <p className="text-gray-600 text-sm">
          To help {displayName} share their skills with you, please fill out the following information.
        </p>

        <div className="space-y-4">
          <h3 className="text-base font-bold tracking-tight">Preferred Days</h3>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day) => (
              <div key={day.full} className="flex flex-col items-center gap-2">
                <Label htmlFor={day.full} className="text-sm font-medium">
                  {day.abbr}
                </Label>
                <Checkbox
                  id={day.full}
                  checked={selectedDays.includes(day.full)}
                  onCheckedChange={(checked) => {
                    setSelectedDays(
                      checked
                        ? [...selectedDays, day.full]
                        : selectedDays.filter((d) => d !== day.full)
                    );
                  }}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold tracking-tight">Preferred time of day:</h3>
          <div className="flex flex-col space-y-2">
            {TIME_PREFERENCES.map((time) => (
              <div key={time.id} className="flex items-center space-x-2">
                <Checkbox
                  id={time.id}
                  checked={timePreferences.includes(time.id)}
                  onCheckedChange={(checked) => {
                    setTimePreferences(
                      checked
                        ? [...timePreferences, time.id]
                        : timePreferences.filter((t) => t !== time.id)
                    );
                  }}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label htmlFor={time.id}>{time.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedDays.length === 0 || timePreferences.length === 0}
          >
            Confirm Request
          </Button>
        </div>
      </div>
    </UniversalDialog>
  );
};

export default RequestScheduleDialog;
