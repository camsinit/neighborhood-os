
// This component handles urgency selection for requests
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoodsRequestUrgency } from "@/components/support/types/formTypes";

// Import urgency level names from constants
import { URGENCY_NAMES } from "../utils/goodsConstants";

// Component props definition
interface UrgencyFieldProps {
  urgency: GoodsRequestUrgency;
  onChange: (urgency: GoodsRequestUrgency) => void;
}

/**
 * UrgencyField component
 * 
 * Renders a dropdown for selecting the urgency level of a request.
 * Only used for request forms, not for offer forms.
 */
const UrgencyField = ({ urgency, onChange }: UrgencyFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="urgency">Urgency</Label>
      <Select 
        value={urgency} 
        onValueChange={(value) => {
          onChange(value as GoodsRequestUrgency);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select urgency" />
        </SelectTrigger>
        <SelectContent>
          {/* Map through all available urgency levels to create dropdown options */}
          {Object.entries(URGENCY_NAMES).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default UrgencyField;
