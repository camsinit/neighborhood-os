
// This component handles the title input field in the skill form

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

// Component props definition
interface TitleFieldProps {
  mode: 'offer' | 'request';
  value: string | undefined;
  onChange: (value: string) => void;
  duplicateWarning: string | null;
}

// Component for entering the skill title
const TitleField = ({ mode, value, onChange, duplicateWarning }: TitleFieldProps) => {
  const placeholder = mode === 'offer' 
    ? 'e.g., Python Programming, Guitar Lessons' 
    : 'e.g., Learn Python, Guitar Basics';
  
  const label = mode === 'offer' 
    ? 'What skill can you teach?' 
    : 'What would you like to learn?';
  
  return (
    <div className="space-y-2">
      <Label htmlFor="title">{label}</Label>
      <div className="space-y-2">
        <Input
          id="title"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
        />
        {duplicateWarning && (
          <div className="flex items-center gap-2 text-yellow-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{duplicateWarning}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TitleField;
