
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SkillDetailInput } from "./SkillDetailInput";
import { requiresDetails, formatSkillWithDetails } from "./skillUtils";

interface SkillCategoryProps {
  title: string;
  skills: string[];
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export const SkillCategory = ({ title, skills, selectedSkills, onSkillsChange }: SkillCategoryProps) => {
  // Track the details for skills that require specificity
  const [skillDetails, setSkillDetails] = useState<Record<string, string>>({});
  
  /**
   * Handle checking/unchecking a skill
   */
  const handleSkillToggle = (skill: string, checked: boolean | string) => {
    // If unchecking, remove the skill
    if (!checked) {
      onSkillsChange(selectedSkills.filter((s) => 
        // Handle both regular skills and skills with details
        !s.startsWith(skill)
      ));
      return;
    }
    
    // If this skill requires details but none provided yet, add the basic skill
    // The user will fill in details after checking
    if (requiresDetails(skill)) {
      const existingDetail = skillDetails[skill] || "";
      // If we have existing detail, format it with the skill
      const skillWithDetail = existingDetail 
        ? formatSkillWithDetails(skill, existingDetail)
        : skill;
        
      // Add the skill (potentially with details)
      onSkillsChange([
        ...selectedSkills.filter(s => !s.startsWith(skill)), 
        skillWithDetail
      ]);
    } else {
      // Regular skill - just add it
      onSkillsChange([...selectedSkills, skill]);
    }
  };
  
  /**
   * Handle updating details for a skill
   */
  const handleDetailChange = (skill: string, details: string) => {
    // Store the details in local state
    setSkillDetails(prev => ({
      ...prev,
      [skill]: details
    }));
    
    // If the skill is currently selected, update it in the parent
    if (selectedSkills.some(s => s === skill || s.startsWith(`${skill}:`))) {
      // Remove the old version of this skill
      const filteredSkills = selectedSkills.filter(s => !s.startsWith(skill));
      
      // Add the skill with updated details
      const skillWithDetail = details 
        ? formatSkillWithDetails(skill, details)
        : skill;
        
      onSkillsChange([...filteredSkills, skillWithDetail]);
    }
  };
  
  /**
   * Determine if a skill is selected
   */
  const isSkillSelected = (skill: string): boolean => {
    return selectedSkills.some(s => 
      s === skill || s.startsWith(`${skill}:`)
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {skills.map((skill) => (
          <div key={skill} className="space-y-1">
            {/* Skill checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`skill-${skill}`}
                checked={isSkillSelected(skill)}
                onCheckedChange={(checked) => handleSkillToggle(skill, checked)}
              />
              <Label htmlFor={`skill-${skill}`} className="text-sm">{skill}</Label>
            </div>
            
            {/* Show detail input if needed and checked */}
            {requiresDetails(skill) && isSkillSelected(skill) && (
              <SkillDetailInput 
                skill={skill}
                value={skillDetails[skill] || ""}
                onChange={(details) => handleDetailChange(skill, details)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
