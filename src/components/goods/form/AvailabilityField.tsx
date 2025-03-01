
// This component handles the availability selection for offers
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Component props definition
interface AvailabilityFieldProps {
  availableDays: number;
  onChange: (days: number) => void;
}

/**
 * AvailabilityField component
 * 
 * Renders an input field for specifying how many days the item will be available.
 * Only used for offer forms, not for request forms.
 */
const AvailabilityField = ({ availableDays, onChange }: AvailabilityFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="availableDays">Available For (days)</Label>
      <Input
        id="availableDays"
        type="number"
        min={1}
        max={365}
        value={availableDays}
        onChange={(e) => {
          onChange(parseInt(e.target.value) || 30);
        }}
        required
      />
    </div>
  );
};

export default AvailabilityField;
