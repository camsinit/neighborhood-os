
// This component handles the availability selection in the skill form

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Component props definition
interface AvailabilityFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

// Component for selecting availability
const AvailabilityField = ({ value, onChange }: AvailabilityFieldProps) => {
  return (
    <>
      <Label htmlFor="availability">Availability</Label>
      <Select 
        value={value} 
        onValueChange={(value: string) => onChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select availability" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="weekdays">Weekdays</SelectItem>
          <SelectItem value="weekends">Weekends</SelectItem>
          <SelectItem value="both">Both</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
};

export default AvailabilityField;
