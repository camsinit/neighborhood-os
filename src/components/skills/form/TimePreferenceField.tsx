
// This component handles the time preference selection in the skill form

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TimePreference } from "../types/skillFormTypes";

// Component props definition
interface TimePreferenceFieldProps {
  values: TimePreference[];
  onChange: (time: string) => void;
}

// Component for selecting preferred time slots
const TimePreferenceField = ({ values, onChange }: TimePreferenceFieldProps) => {
  const timeOptions: TimePreference[] = ['morning', 'afternoon', 'evening'];
  
  return (
    <div className="space-y-2">
      <Label>Preferred Times (Select all that apply)</Label>
      <div className="flex flex-wrap gap-2">
        {timeOptions.map((time) => (
          <Button
            key={time}
            type="button"
            variant={values.includes(time) ? 'default' : 'outline'}
            onClick={() => onChange(time)}
            className="flex-1"
          >
            {time.charAt(0).toUpperCase() + time.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TimePreferenceField;
