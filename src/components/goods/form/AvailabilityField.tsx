
// This component handles the availability selection for offers
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Component props definition
interface AvailabilityFieldProps {
  availableDays: number;
  onChange: (days: number) => void;
}

/**
 * AvailabilityField component
 * 
 * Renders an input field for specifying how many days the item will be available,
 * along with a checkbox to indicate if there's no time limit.
 */
const AvailabilityField = ({ availableDays, onChange }: AvailabilityFieldProps) => {
  // Handle checkbox changes
  const handleNoLimitChange = (checked: boolean) => {
    // If checked, set to 365 days (effectively no limit)
    // If unchecked, restore to previous value or default to 30
    onChange(checked ? 365 : 30);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="availableDays">Available For (days)</Label>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="noLimit"
            checked={availableDays === 365}
            onCheckedChange={handleNoLimitChange}
          />
          <Label 
            htmlFor="noLimit" 
            className="text-sm text-gray-600 cursor-pointer"
          >
            No limit
          </Label>
        </div>
      </div>
      <Input
        id="availableDays"
        type="number"
        min={1}
        max={365}
        value={availableDays}
        onChange={(e) => {
          onChange(parseInt(e.target.value) || 30);
        }}
        disabled={availableDays === 365}
        required
      />
    </div>
  );
};

export default AvailabilityField;

