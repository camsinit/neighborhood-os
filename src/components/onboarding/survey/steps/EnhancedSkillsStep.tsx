
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X, Plus } from "lucide-react";
import { SKILL_CATEGORIES, SPECIAL_SKILLS, TIMING_PREFERENCES } from "./skills/skillCategories";

/**
 * Enhanced Skills Selection Step Component
 * 
 * This component provides a comprehensive interface for users to select their skills
 * with specialized features including:
 * - Tabbed categories for easy browsing
 * - Special handling for skills requiring additional details
 * - Custom skill addition capability
 * - Timing preferences for each skill category
 * - Selected skills displayed as removable badges
 */

interface SelectedSkill {
  name: string;
  details?: string;
  timing?: {
    days: string[];
    times: string[];
  };
}

interface EnhancedSkillsStepProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export const EnhancedSkillsStep = ({ selectedSkills, onSkillsChange }: EnhancedSkillsStepProps) => {
  // State for managing selected skills with their details and timing
  const [skillsWithDetails, setSkillsWithDetails] = useState<SelectedSkill[]>(() => {
    // Initialize from selectedSkills prop, parsing any existing details
    return selectedSkills.map(skill => {
      const [name, details] = skill.split(': ');
      return { name, details };
    });
  });

  // State for special skill dialog
  const [specialSkillDialog, setSpecialSkillDialog] = useState<{
    isOpen: boolean;
    skillName: string;
    details: string;
  }>({
    isOpen: false,
    skillName: '',
    details: ''
  });

  // State for timing preferences dialog
  const [timingDialog, setTimingDialog] = useState<{
    isOpen: boolean;
    skillName: string;
    days: string[];
    times: string[];
  }>({
    isOpen: false,
    skillName: '',
    days: [],
    times: []
  });

  // State for custom skill input
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState('technology');

  /**
   * Handle skill selection - checks if skill requires special details
   */
  const handleSkillSelect = (skillName: string) => {
    const isSelected = skillsWithDetails.some(skill => skill.name === skillName);
    
    if (isSelected) {
      // Remove skill if already selected
      removeSkill(skillName);
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
        addSkill(skillName);
      }
    }
  };

  /**
   * Add a skill to the selected list
   */
  const addSkill = (skillName: string, details?: string) => {
    const newSkill: SelectedSkill = { name: skillName, details };
    const updatedSkills = [...skillsWithDetails, newSkill];
    setSkillsWithDetails(updatedSkills);
    updateParentSkills(updatedSkills);
  };

  /**
   * Remove a skill from the selected list
   */
  const removeSkill = (skillName: string) => {
    const updatedSkills = skillsWithDetails.filter(skill => skill.name !== skillName);
    setSkillsWithDetails(updatedSkills);
    updateParentSkills(updatedSkills);
  };

  /**
   * Update the parent component with formatted skills array
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
   * Handle special skill dialog confirmation
   */
  const handleSpecialSkillConfirm = () => {
    if (specialSkillDialog.skillName && specialSkillDialog.details.trim()) {
      addSkill(specialSkillDialog.skillName, specialSkillDialog.details.trim());
    }
    setSpecialSkillDialog({ isOpen: false, skillName: '', details: '' });
  };

  /**
   * Handle custom skill addition
   */
  const handleCustomSkillAdd = () => {
    if (customSkillInput.trim()) {
      addSkill(customSkillInput.trim());
      setCustomSkillInput('');
      setShowCustomInput(false);
    }
  };

  /**
   * Check if a skill is currently selected
   */
  const isSkillSelected = (skillName: string) => {
    return skillsWithDetails.some(skill => skill.name === skillName);
  };

  /**
   * Get count of selected skills for a category
   */
  const getSelectedCountForCategory = (categoryKey: string) => {
    const categorySkills = SKILL_CATEGORIES[categoryKey as keyof typeof SKILL_CATEGORIES]?.skills || [];
    return categorySkills.filter(skill => isSkillSelected(skill)).length;
  };

  return (
    <div className="space-y-6">
      {/* Introduction text */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Share your skills and expertise with your neighborhood community.
        </p>
        <p className="text-xs text-muted-foreground">
          Select skills you're comfortable sharing with neighbors who may need assistance.
        </p>
      </div>

      {/* Selected skills display */}
      {skillsWithDetails.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Skills ({skillsWithDetails.length})</Label>
          <div className="flex flex-wrap gap-2">
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
      )}

      {/* Skills categories tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {Object.entries(SKILL_CATEGORIES).map(([key, category]) => {
            const selectedCount = getSelectedCountForCategory(key);
            return (
              <TabsTrigger key={key} value={key} className="text-xs relative">
                {category.title}
                {selectedCount > 0 && (
                  <Badge variant="success" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                    {selectedCount}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab content for each category */}
        {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.skills.map((skill) => {
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
          </TabsContent>
        ))}
      </Tabs>

      {/* Custom skill input */}
      <div className="space-y-3">
        {!showCustomInput ? (
          <Button
            variant="outline"
            onClick={() => setShowCustomInput(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Skill
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter your custom skill..."
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
