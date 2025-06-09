
// This component handles the title input in the goods form

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Component props definition
interface TitleFieldProps {
  mode: 'offer' | 'request';
  value: string | undefined;
  onChange: (value: string) => void;
}

/**
 * TitleField component for Goods form
 * 
 * This component renders a text input for entering item titles
 * with different placeholder text based on whether it's an offer or request.
 * Updated with shorter width for better UX.
 */
const TitleField = ({ mode, value, onChange }: TitleFieldProps) => {
  // Define placeholder text based on mode
  const placeholder = mode === 'offer' 
    ? 'What are you offering?' 
    : 'What do you need?';
  
  // Define label text based on mode  
  const label = mode === 'offer' 
    ? 'Title' 
    : 'Item Title';
  
  return (
    <div className="space-y-2">
      <Label htmlFor="title">{label}</Label>
      <Input
        id="title"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full max-w-sm"
      />
    </div>
  );
};

export default TitleField;
