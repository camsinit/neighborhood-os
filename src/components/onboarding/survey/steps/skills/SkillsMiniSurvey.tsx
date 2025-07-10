
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, X, Plus, Check } from "lucide-react";
import { SKILL_CATEGORIES, SPECIAL_SKILLS } from "./skillCategories";
import { SelectedSkillsOverlay } from "./SelectedSkillsOverlay";

/**
 * Skills Mini-Survey Component (Simplified - No Availability)
 * 
 * This component creates a condensed mini-survey experience within the Skills & Interests step,
 * optimized for better space utilization and visibility of all UI elements.
 * UPDATED: Removed availability and time preferences - onboarding now only collects skills.
 */

interface SelectedSkill {
  name: string;
  details?: string;
}

interface SkillsMiniSurveyProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  onSurveyStateChange?: (hasCompleted: boolean, hasSkills: boolean) => void;
  onMiniSurveyProgress?: (currentStep: number, totalSteps: number, hasCompleted: boolean) => void;
}

export const SkillsMiniSurvey = ({ 
  selectedSkills, 
  onSkillsChange, 
  onSurveyStateChange,
  onMiniSurveyProgress
}: SkillsMiniSurveyProps) => {
  // Convert selectedSkills prop to internal format for easier manipulation
  const [skillsWithDetails, setSkillsWithDetails] = useState<SelectedSkill[]>(() => {
    return selectedSkills.map(skill => {
      const [name, details] = skill.split(': ');
      return { name, details };
    });
  });

  // Current category step (0-5: categories, 6: summary)
  const [currentStep, setCurrentStep] = useState(0);
  
  // Track if user has completed the mini-survey (reached the summary step)
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  
  // Dialog state for special skills that require additional details
  const [specialSkillDialog, setSpecialSkillDialog] = useState<{
    isOpen: boolean;
    skillName: string;
    details: string;
  }>({
    isOpen: false,
    skillName: '',
    details: ''
  });

  // Custom skill input state for adding user-defined skills
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Calculate total steps and current position (removed availability step)
  const categoryKeys = Object.keys(SKILL_CATEGORIES);
  const totalSteps = categoryKeys.length + 1; // categories + summary (no availability)
  const isOnSummary = currentStep === categoryKeys.length;

  // Update survey completion state whenever currentStep changes
  useEffect(() => {
    const isCompleted = isOnSummary;
    const hasSkills = skillsWithDetails.length > 0;
    
    console.log('Skills mini-survey state update:', { 
      currentStep, 
      isOnSummary, 
      isCompleted, 
      hasSkills, 
      skillsCount: skillsWithDetails.length 
    });
    
    setHasCompletedSurvey(isCompleted);
    
    // Notify parent component of survey state changes
    if (onSurveyStateChange) {
      onSurveyStateChange(isCompleted, hasSkills);
    }
  }, [currentStep, isOnSummary, skillsWithDetails.length, onSurveyStateChange]);

  // Notify parent component of mini-survey progress changes
  useEffect(() => {
    if (onMiniSurveyProgress) {
      onMiniSurveyProgress(currentStep, totalSteps, hasCompletedSurvey);
    }
  }, [currentStep, totalSteps, hasCompletedSurvey, onMiniSurveyProgress]);

  /**
   * Update parent component with formatted skills array
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
   * Handle skill selection toggle - add or remove skills from selection
   */
  const handleSkillSelect = (skillName: string) => {
    const isSelected = skillsWithDetails.some(skill => skill.name === skillName);
    
    if (isSelected) {
      // Remove skill from selection
      const updatedSkills = skillsWithDetails.filter(skill => skill.name !== skillName);
      setSkillsWithDetails(updatedSkills);
      updateParentSkills(updatedSkills);
    } else {
      // Check if this skill requires additional details
      if (SPECIAL_SKILLS[skillName as keyof typeof SPECIAL_SKILLS]) {
        setSpecialSkillDialog({
          isOpen: true,
          skillName,
          details: ''
        });
      } else {
        // Add regular skill without details
        const newSkill: SelectedSkill = { name: skillName };
        const updatedSkills = [...skillsWithDetails, newSkill];
        setSkillsWithDetails(updatedSkills);
        updateParentSkills(updatedSkills);
      }
    }
  };

  /**
   * Handle special skill dialog confirmation and add skill with details
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
   * Handle custom skill addition from user input
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
   * Remove a skill from selections (used by overlay component)
   */
  const removeSkill = (skillName: string) => {
    const updatedSkills = skillsWithDetails.filter(skill => skill.name !== skillName);
    setSkillsWithDetails(updatedSkills);
    updateParentSkills(updatedSkills);
  };

  /**
   * Check if a skill is currently selected
   */
  const isSkillSelected = (skillName: string) => {
    return skillsWithDetails.some(skill => skill.name === skillName);
  };

  /**
   * Get skills for current category step
   */
  const getCurrentCategorySkills = () => {
    if (isOnSummary) return [];
    const categoryKey = categoryKeys[currentStep];
    return SKILL_CATEGORIES[categoryKey as keyof typeof SKILL_CATEGORIES]?.skills || [];
  };

  /**
   * Get current category information
   */
  const getCurrentCategory = () => {
    if (isOnSummary) return null;
    const categoryKey = categoryKeys[currentStep];
    return SKILL_CATEGORIES[categoryKey as keyof typeof SKILL_CATEGORIES];
  };

  /**
   * Navigation handlers for moving between steps
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

  // Summary step content - shows all selected skills for review
  if (isOnSummary) {
    return (
      <div className="space-y-4">
        {/* Condensed header */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold">Skills Summary</h3>
          <p className="text-xs text-muted-foreground">
            Review your selected skills. You can go back to make changes or continue to complete the onboarding.
          </p>
        </div>

        {/* Skills display section */}
        {skillsWithDetails.length > 0 ? (
          <div className="space-y-3">
            <div className="text-center">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {skillsWithDetails.length} skills selected
              </Badge>
            </div>
            {/* Condensed skills grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
              {skillsWithDetails.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center justify-between gap-1 text-xs p-1.5">
                  <span className="truncate text-xs">
                    {skill.details ? `${skill.name}: ${skill.details}` : skill.name}
                  </span>
                  <button
                    onClick={() => removeSkill(skill.name)}
                    className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5 flex-shrink-0"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              No skills selected. You can go back to add skills or continue without any.
            </p>
          </div>
        )}

        {/* Condensed navigation for summary */}
        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" onClick={handlePrevious} size="sm">
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back
          </Button>
          <div className="text-xs text-muted-foreground">
            Review Complete
          </div>
          <div className="w-16" /> {/* Spacer for layout balance */}
        </div>
      </div>
    );
  }

  // Category step content - shows skills for current category
  const currentCategory = getCurrentCategory();
  const currentSkills = getCurrentCategorySkills();

  return (
    <div className="space-y-4">
      {/* Selected skills overlay - only show on category steps */}
      <SelectedSkillsOverlay 
        selectedSkills={skillsWithDetails}
        onRemoveSkill={removeSkill}
      />

      {/* Condensed category header */}
      <div className="text-center space-y-1">
        <h3 className="text-base font-semibold">{currentCategory?.title}</h3>
        <p className="text-xs text-muted-foreground">
          Select any {currentCategory?.title.toLowerCase()} skills you have.
        </p>
      </div>

      {/* Condensed skills grid for current category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
        {currentSkills.map((skill) => {
          const selected = isSkillSelected(skill);
          return (
            <div
              key={skill}
              className={`p-2 border rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
                selected ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
              onClick={() => handleSkillSelect(skill)}
            >
              <div className="flex items-center space-x-1.5">
                <Checkbox
                  checked={selected}
                  onChange={() => {}} // Handled by parent div click
                />
                <span className="text-xs font-medium truncate">{skill}</span>
                {SPECIAL_SKILLS[skill as keyof typeof SPECIAL_SKILLS] && (
                  <Badge variant="outline" className="text-xs px-1 py-0">Details</Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Condensed custom skill input for current category */}
      <div className="space-y-2">
        {!showCustomInput ? (
          <Button
            variant="outline"
            onClick={() => setShowCustomInput(true)}
            className="w-full h-8 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Custom {currentCategory?.title} Skill
          </Button>
        ) : (
          <div className="flex gap-1">
            <Input
              placeholder={`Enter custom ${currentCategory?.title.toLowerCase()} skill...`}
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSkillAdd()}
              className="h-8 text-xs"
            />
            <Button onClick={handleCustomSkillAdd} disabled={!customSkillInput.trim()} size="sm" className="h-8 px-2">
              <Check className="h-3 w-3 text-white" />
            </Button>
            <Button variant="outline" onClick={() => {
              setShowCustomInput(false);
              setCustomSkillInput('');
            }} size="sm" className="h-8 px-2">
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Condensed navigation */}
      <div className="flex justify-between items-center pt-2">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 0}
          size="sm"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back
        </Button>
        
        <div className="text-xs text-muted-foreground">
          {currentCategory?.title}
        </div>
        
        <Button onClick={handleNext} size="sm">
          {currentStep < categoryKeys.length - 1 ? 'Next' : 'Summary'}
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>

      {/* Special skill details dialog */}
      <Dialog open={specialSkillDialog.isOpen} onOpenChange={(open) => 
        setSpecialSkillDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Add Details for {specialSkillDialog.skillName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">
                {SPECIAL_SKILLS[specialSkillDialog.skillName as keyof typeof SPECIAL_SKILLS]?.prompt}
              </Label>
              <Input
                placeholder={SPECIAL_SKILLS[specialSkillDialog.skillName as keyof typeof SPECIAL_SKILLS]?.placeholder}
                value={specialSkillDialog.details}
                onChange={(e) => setSpecialSkillDialog(prev => ({ ...prev, details: e.target.value }))}
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => 
              setSpecialSkillDialog({ isOpen: false, skillName: '', details: '' })
            } size="sm">
              Cancel
            </Button>
            <Button onClick={handleSpecialSkillConfirm} size="sm">
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
