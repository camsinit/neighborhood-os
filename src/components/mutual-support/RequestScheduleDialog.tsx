
import { useState } from "react";
import DialogWrapper from "@/components/dialog/DialogWrapper";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface RequestScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (schedule: {
    days: string[];
    timePreference: string;
  }) => void;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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
}: RequestScheduleDialogProps) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timePreference, setTimePreference] = useState<string>("");

  const handleConfirm = () => {
    onConfirm({
      days: selectedDays,
      timePreference,
    });
    onOpenChange(false);
  };

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Schedule Your Request"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Select available days:</Label>
          <div className="grid grid-cols-2 gap-4">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={day}
                  checked={selectedDays.includes(day)}
                  onCheckedChange={(checked) => {
                    setSelectedDays(
                      checked
                        ? [...selectedDays, day]
                        : selectedDays.filter((d) => d !== day)
                    );
                  }}
                />
                <Label htmlFor={day}>{day}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Preferred time of day:</Label>
          <RadioGroup
            value={timePreference}
            onValueChange={setTimePreference}
            className="flex flex-col space-y-2"
          >
            {TIME_PREFERENCES.map((time) => (
              <div key={time.id} className="flex items-center space-x-2">
                <RadioGroupItem value={time.id} id={time.id} />
                <Label htmlFor={time.id}>{time.label}</Label>
              </div>
            ))}
          </RadioGroup>
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
            disabled={selectedDays.length === 0 || !timePreference}
          >
            Confirm Request
          </Button>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default RequestScheduleDialog;
