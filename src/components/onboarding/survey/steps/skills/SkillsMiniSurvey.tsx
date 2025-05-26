
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, X, Plus } from "lucide-react";
import { SKILL_CATEGORIES, SPECIAL_SKILLS } from "./skillCategories";

/**
 * Skills Mini-Survey Component
 * 
 * This component creates a mini-survey experience within the Skills & Interests step,
 * allowing users to progress through each skill category one at a time.
 */

interface SelectedSkill {
  name: string;
  details?: string;
}

interface SkillsMiniSurveyProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export const SkillsMiniSurvey = ({ selectedSkills, onSkillsChange }: SkillsMiniSurveyProps) => {
  // Convert selectedSkills prop to internal format
  const [skillsWithDetails, setSkillsWithDetails] = useState<SelectedSkill[]>(() => {
    return selectedSkills.map(skill => {
      const [name, details] = skill.split(': ');
      return { name, details };
    });
  });

  // Current category step (0-5: categories, 6: summary)
  const [currentStep, setCurrentStep] = useState(0);
  
  // Dialog state for special skills
  const [specialSkillDialog, setSpecialSkillDialog] = useState<{
    isOpen: boolean;
    skillName: string;
    details: string;
  }>({
    isOpen: false,
    skillName: '',
    details: ''
  });

  // Custom skill input state
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const categoryKeys = Object.keys(SKILL_CATEGORIES);
  const totalSteps = categoryKeys.length + 1; // categories + summary
  const isOnSummary = currentStep === categoryKeys.length;

  /**
   * Update parent component with formatted skills
   */
  const updateParentSkills = (skills: SelectedSkill[]) => {
    const formattedSkills = skills.map(skill => {
      if (skill.details) {
        return `${skill.name}: ${skill.details}`;
      }
      return skill.name;
    });
    onSkillsChange(formattedSkills);
  };

  /**
   * Handle skill selection toggle
   */
  const handleSkillSelect = (skillName: string) => {
    const isSelected = skillsWithDetails.some(skill => skill.name === skillName);
    
    if (isSelected) {
      // Remove skill
      const updatedSkills = skillsWithDetails.filter(skill => skill.name !== skillName);
      setSkillsWithDetails(updatedSkills);
      updateParentSkills(updatedSkills);
    } else {
      // Check if this is a special skill requiring details
      if (SPECIAL_SKILLS[skillName as keyof typeof SPECIAL_SKILLS]) {
        setSpecialSkillDialog({
          isOpen: true,
          skillName,
          details: ''
        });
      } else {
        // Add regular skill
        const newSkill: SelectedSkill = { name: skillName };
        const updatedSkills = [...skillsWithDetails, newSkill];
        setSkillsWithDetails(updatedSkills);
        updateParentSkills(updatedSkills);
      }
    }
  };

  /**
   * Handle special skill dialog confirmation
   */
  const handleSpecialSkillConfirm = () => {
    if (specialSkillDialog.skillName && specialSkillDialog.details.trim()) {
      const newSkill: SelectedSkill = { 
        name: specialSkillDialog.skillName, 
        details: specialSkillDialog.details.trim() 
      };
      const updatedSkills = [...skillsWithDetails, newSkill];
      setSkillsWithDetails(updatedSkills);
      updateParentSkills(updatedSkills);
    }
    setSpecialSkillDialog({ isOpen: false, skillName: '', details: '' });
  };

  /**
   * Handle custom skill addition
   */
  const handleCustomSkillAdd = () => {
    if (customSkillInput.trim()) {
      const newSkill: SelectedSkill = { name: customSkillInput.trim() };
      const updatedSkills = [...skillsWithDetails, newSkill];
      setSkillsWithDetails(updatedSkills);
      updateParentSkills(updatedSkills);
      setCustomSkillInput('');
      setShowCustomInput(false);
    }
  };

  /**
   * Remove a skill from selections
   */
  const removeSkill = (skillName: string) => {
    const updatedSkills = skillsWithDetails.filter(skill => skill.name !== skillName);
    setSkillsWithDetails(updatedSkills);
    updateParentSkills(updatedSkills);
  };

  /**
   * Check if a skill is selected
   */
  const isSkillSelected = (skillName: string) => {
    return skillsWithDetails.some(skill => skill.name === skillName);
  };

  /**
   * Get skills for current category
   */
  const getCurrentCategorySkills = () => {
    if (isOnSummary) return [];
    const categoryKey = categoryKeys[currentStep];
    return SKILL_CATEGORIES[categoryKey as keyof typeof SKILL_CATEGORIES]?.skills || [];
  };

  /**
   * Get current category info
   */
  const getCurrentCategory = () => {
    if (isOnSummary) return null;
    const categoryKey = categoryKeys[currentStep];
    return SKILL_CATEGORIES[categoryKey as keyof typeof SKILL_CATEGORIES];
  };

  /**
   * Navigation handlers
   */
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      setShowCustomInput(false); // Reset custom input when moving to next step
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowCustomInput(false); // Reset custom input when moving to previous step
    }
  };

  // Summary step content
  if (isOnSummary) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Skills Summary</h3>
          <p className="text-sm text-muted-foreground">
            Review your selected skills. You can go back to make changes if needed.
          </p>
        </div>

        {skillsWithDetails.length > 0 ? (
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant="success" className="text-sm">
                {skillsWithDetails.length} skills selected
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {skillsWithDetails.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <span className="text-xs">
                    {skill.details ? `${skill.name}: ${skill.details}` : skill.name}
                  </span>
                  <button
                    onClick={() => removeSkill(skill.name)}
                    className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No skills selected. You can go back to add skills or continue without any.
            </p>
          </div>
        )}

        {/* Navigation for summary */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handlePrevious}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground self-center">
            Step {currentStep + 1} of {totalSteps}
          </div>
          <div /> {/* Spacer for layout */}
        </div>
      </div>
    );
  }

  // Category step content
  const currentCategory = getCurrentCategory();
  const currentSkills = getCurrentCategorySkills();

  return (
    <div className="space-y-6">
      {/* Category header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{currentCategory?.title}</h3>
        <p className="text-sm text-muted-foreground">
          Select any {currentCategory?.title.toLowerCase()} skills you have.
        </p>
      </div>

      {/* Skills grid for current category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {currentSkills.map((skill) => {
          const selected = isSkillSelected(skill);
          return (
            <div
              key={skill}
              className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleSkillSelect(skill)}
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selected}
                  onChange={() => {}} // Handled by parent div click
                />
                <span className="text-sm font-medium">{skill}</span>
                {SPECIAL_SKILLS[skill as keyof typeof SPECIAL_SKILLS] && (
                  <Badge variant="outline" className="text-xs">Details</Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom skill input for current category */}
      <div className="space-y-3">
        {!showCustomInput ? (
          <Button
            variant="outline"
            onClick={() => setShowCustomInput(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom {currentCategory?.title} Skill
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder={`Enter your custom ${currentCategory?.title.toLowerCase()} skill...`}
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSkillAdd()}
            />
            <Button onClick={handleCustomSkillAdd} disabled={!customSkillInput.trim()}>
              Add
            </Button>
            <Button variant="outline" onClick={() => {
              setShowCustomInput(false);
              setCustomSkillInput('');
            }}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="text-sm text-muted-foreground self-center">
          Step {currentStep + 1} of {totalSteps}
        </div>
        
        <Button onClick={handleNext}>
          {currentStep < totalSteps - 2 ? 'Next' : 'Summary'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Special skill details dialog */}
      <Dialog open={specialSkillDialog.isOpen} onOpenChange={(open) => 
        setSpecialSkillDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Details for {specialSkillDialog.skillName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>
                {SPECIAL_SKILLS[specialSkillDialog.skillName as keyof typeof SPECIAL_SKILLS]?.prompt}
              </Label>
              <Input
                placeholder={SPECIAL_SKILLS[specialSkillDialog.skillName as keyof typeof SPECIAL_SKILLS]?.placeholder}
                value={specialSkillDialog.details}
                onChange={(e) => setSpecialSkillDialog(prev => ({ ...prev, details: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => 
              setSpecialSkillDialog({ isOpen: false, skillName: '', details: '' })
            }>
              Cancel
            </Button>
            <Button onClick={handleSpecialSkillConfirm}>
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
