import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const SKILLS_OPTIONS = [
  "Medical (Doctor, Nurse, EMT)",
  "Mental Health (Counselor, Therapist)",
  "Construction/Home Repair",
  "Electrical Work",
  "Plumbing",
  "Legal Knowledge",
  "Financial/Accounting",
  "IT/Technical Support",
  "First Aid/CPR Certified",
  "Emergency Response Training",
  "Search and Rescue Experience",
  "Fire Safety Training",
  "Childcare/Education",
  "Elder Care",
  "Pet Care/Veterinary",
  "Cooking/Meal Preparation",
  "Language Translation/Interpretation",
  "Gardening/Landscaping",
  "Car Maintenance/Repair",
  "Solar/Alternative Energy Knowledge",
];

interface SkillsStepProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export const SkillsStep = ({ selectedSkills, onSkillsChange }: SkillsStepProps) => {
  return (
    <div className="space-y-4">
      <div className="h-[300px] overflow-y-auto space-y-2">
        {SKILLS_OPTIONS.map((skill) => (
          <div key={skill} className="flex items-center space-x-2">
            <Checkbox
              id={skill}
              checked={selectedSkills.includes(skill)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSkillsChange([...selectedSkills, skill]);
                } else {
                  onSkillsChange(selectedSkills.filter((s) => s !== skill));
                }
              }}
            />
            <Label htmlFor={skill}>{skill}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};