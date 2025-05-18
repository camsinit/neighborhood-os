
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SkillCategoryProps {
  title: string;
  skills: string[];
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export const SkillCategory = ({ title, skills, selectedSkills, onSkillsChange }: SkillCategoryProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div key={skill} className="flex items-center space-x-2">
            <Checkbox
              id={`skill-${skill}`} // Ensure unique IDs
              checked={selectedSkills.includes(skill)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSkillsChange([...selectedSkills, skill]);
                } else {
                  onSkillsChange(selectedSkills.filter((s) => s !== skill));
                }
              }}
            />
            <Label htmlFor={`skill-${skill}`} className="text-sm">{skill}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};
