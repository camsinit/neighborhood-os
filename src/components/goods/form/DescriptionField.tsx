
// This component handles the description textarea in the goods form

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Component props definition
interface DescriptionFieldProps {
  mode: 'offer' | 'request';
  value: string | undefined;
  onChange: (value: string) => void;
}

/**
 * DescriptionField component for Goods form
 * 
 * This component renders a textarea for entering item descriptions
 * with different placeholder text based on whether it's an offer or request.
 * Updated with compact spacing.
 */
const DescriptionField = ({ mode, value, onChange }: DescriptionFieldProps) => {
  // Define placeholder text based on mode
  const placeholder = mode === 'offer' 
    ? 'Provide details about the item (condition, size, etc.)' 
    : 'Describe what you need and any specific requirements';
  
  // Define label text based on mode
  const label = mode === 'offer' 
    ? 'Description' 
    : 'What do you need? Include any specific details';
  
  return (
    <div className="space-y-1">
      <Label htmlFor="description">{label}</Label>
      <Textarea
        id="description"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="min-h-[80px] w-full resize-none"
      />
    </div>
  );
};

export default DescriptionField;
