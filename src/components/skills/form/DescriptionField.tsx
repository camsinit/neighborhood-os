
// This component handles the description textarea in the skill form

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Component props definition
interface DescriptionFieldProps {
  mode: 'offer' | 'request';
  value: string | undefined;
  onChange: (value: string) => void;
}

// Component for entering the skill description
const DescriptionField = ({ mode, value, onChange }: DescriptionFieldProps) => {
  const placeholder = mode === 'offer' 
    ? 'Share your expertise and how you can help others learn'
    : 'Share what you hope to learn and achieve';
  
  const label = mode === 'offer' 
    ? 'Describe your experience and teaching approach' 
    : 'What aspects would you like to learn? Any specific goals?';
  
  return (
    <div className="space-y-2">
      <Label htmlFor="description">{label}</Label>
      <Textarea
        id="description"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
      />
    </div>
  );
};

export default DescriptionField;
