
// This component handles the description textarea in the skill form

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Component props definition
interface DescriptionFieldProps {
  mode: 'offer' | 'request';
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
}

// Component for entering the skill description
const DescriptionField = ({ mode, value, onChange, error }: DescriptionFieldProps) => {
  const placeholder = mode === 'offer' 
    ? 'Share your experience, what makes you passionate about this, and how you\'d love to help others learn'
    : 'Share what you hope to learn and achieve';
  
  const label = mode === 'offer' 
    ? 'Tell us about your experience and how you\'d like to help' 
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
        className={error ? "border-red-500" : ""}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DescriptionField;
