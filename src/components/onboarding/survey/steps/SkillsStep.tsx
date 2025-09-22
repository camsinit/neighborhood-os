
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const SKILLS_OPTIONS = [
  // Technology
  "Computer, Smartphone, Tablet Help",
  "WiFi Troubleshooting",
  "Social Media Help",
  "Photo Organization & Sharing",
  "Printer Setup & Troubleshooting",
  "Password Management Help",
  "Streaming Service Setup",
  "Kid-Safe Internet Setup",
  
  // Safety & Emergency
  "First Aid/CPR Certified",
  "Medical Professional (Doctor, Nurse, EMT)",
  "Home Hazard Assessments",
  "Babyproofing",
  "Power Outage Help",
  "HAM Radio",
  "Personal Emergency Preparedness",
  "CERT/CORE-Trained",
  
  // Life Skills
  "Resume & Job Application Help",
  "Language Translation & Practice",
  "Basic Accounting Support",
  "College/School Application Help",
  "Interview Practice",
  "Basic Legal Support",
  "Emotional Support & Listening",
  "Conflict Resolution",
  
  // Daily Support
  "Occasional Childcare",
  "Occasional Dog Walking",
  "Elder Companionship",
  "Meal Exchanges",
  "House Sitting & Pet Sitting",
  "Plant Watering",
  
  // Learning & Fun
  "Homework Sessions",
  "Gardening Tips",
  "Music Jams",
  "Arts & Crafts Activities",
  "Sports",
  "Hobby Sharing & Teaching",
];

/**
 * SkillsStep component
 * 
 * This step allows users to select skills they have that could benefit the neighborhood.
 * Each skill is presented as a checkbox that can be toggled on/off.
 */
interface SkillsStepProps {
  selectedSkills: string[]; // Changed from 'skills' to 'selectedSkills'
  onSkillsChange: (skills: string[]) => void;
}

export const SkillsStep = ({ selectedSkills, onSkillsChange }: SkillsStepProps) => {
  return (
    <div className="space-y-4">
      {/* Description text explaining the purpose of sharing skills */}
      <p className="text-sm text-muted-foreground mb-4">
        Select any skills you have that might benefit your neighborhood. 
        These will be visible to neighbors who may need assistance.
      </p>
      
      {/* Scrollable skills selection area */}
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
