
// This component handles the category selection field in the skill form

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkillCategory } from "../types/skillTypes";

// Component props definition
interface CategoryFieldProps {
  value: SkillCategory | undefined;
  onChange: (value: SkillCategory) => void;
  error?: string;
}

// Component for selecting a skill category
const CategoryField = ({ value, onChange, error }: CategoryFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="category">Skill Category</Label>
      <Select 
        value={value} 
        onValueChange={(value: SkillCategory) => onChange(value)}
        required
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="technology">Technology</SelectItem>
          <SelectItem value="creative">Creative</SelectItem>
          <SelectItem value="trade">Trade Skills</SelectItem>
          <SelectItem value="education">Education</SelectItem>
          <SelectItem value="wellness">Wellness</SelectItem>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default CategoryField;
