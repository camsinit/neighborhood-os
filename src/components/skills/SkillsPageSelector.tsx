
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Plus, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SKILL_CATEGORIES, SPECIAL_SKILLS } from '@/components/onboarding/survey/steps/skills/skillCategories';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import { useSkillsExchange } from '@/hooks/skills/useSkillsExchange';
import { toast } from 'sonner';

/**
 * SkillsPageSelector - Adapted from onboarding for skills page
 * 
 * This component provides a guided skill selection experience similar to onboarding
 * but optimized for the skills page. Users can browse pre-defined skills by category
 * and easily add custom skills. All skills are immediately saved to the database.
 */
interface SkillsPageSelectorProps {
  selectedCategory: SkillCategory;
  onSkillAdded: () => void; // Callback when a skill is successfully added
}

interface SelectedSkill {
  name: string;
  details?: string;
}

const SkillsPageSelector: React.FC<SkillsPageSelectorProps> = ({
  selectedCategory,
  onSkillAdded
}) => {
  // Track selected skills for this session
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  
  // Custom skill input state
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Special skill dialog state
  const [specialSkillDialog, setSpecialSkillDialog] = useState<{
    isOpen: boolean;
    skillName: string;
    details: string;
  }>({
    isOpen: false,
    skillName: '',
    details: ''
  });

  // Hook for submitting skills to database
  const { handleSubmit } = useSkillsExchange({
    onSuccess: () => {
      onSkillAdded();
    }
  });

  // Get skills for the selected category
  const categorySkills = SKILL_CATEGORIES[selectedCategory]?.skills || [];
  const categoryTitle = SKILL_CATEGORIES[selectedCategory]?.title || selectedCategory;

  /**
   * Handle skill selection toggle
   */
  const handleSkillSelect = async (skillName: string) => {
    const isSelected = selectedSkills.some(skill => skill.name === skillName);
    
    if (isSelected) {
      // Remove skill from local selection
      setSelectedSkills(prev => prev.filter(skill => skill.name !== skillName));
    } else {
      // Check if this skill requires additional details
      if (SPECIAL_SKILLS[skillName as keyof typeof SPECIAL_SKILLS]) {
        setSpecialSkillDialog({
          isOpen: true,
          skillName,
          details: ''
        });
      } else {
        // Add skill immediately to database
        try {
          await handleSubmit({
            title: skillName,
            category: selectedCategory,
            description: `${skillName} skill`
          }, 'offer');
          
          // Add to local selection for UI feedback
          setSelectedSkills(prev => [...prev, { name: skillName }]);
        } catch (error) {
          console.error('Error adding skill:', error);
          toast.error('Failed to add skill. Please try again.');
        }
      }
    }
  };

  /**
   * Handle special skill dialog confirmation
   */
  const handleSpecialSkillConfirm = async () => {
    if (specialSkillDialog.skillName && specialSkillDialog.details.trim()) {
      try {
        await handleSubmit({
          title: specialSkillDialog.skillName,
          category: selectedCategory,
          description: specialSkillDialog.details.trim()
        }, 'offer');
        
        // Add to local selection
        setSelectedSkills(prev => [...prev, { 
          name: specialSkillDialog.skillName, 
          details: specialSkillDialog.details.trim() 
        }]);
        
        toast.success('Skill added successfully!');
      } catch (error) {
        console.error('Error adding special skill:', error);
        toast.error('Failed to add skill. Please try again.');
      }
    }
    setSpecialSkillDialog({ isOpen: false, skillName: '', details: '' });
  };

  /**
   * Handle custom skill addition
   */
  const handleCustomSkillAdd = async () => {
    if (customSkillInput.trim()) {
      try {
        await handleSubmit({
          title: customSkillInput.trim(),
          category: selectedCategory,
          description: `Custom ${customSkillInput.trim()} skill`
        }, 'offer');
        
        // Add to local selection
        setSelectedSkills(prev => [...prev, { name: customSkillInput.trim() }]);
        setCustomSkillInput('');
        setShowCustomInput(false);
        
        toast.success('Custom skill added successfully!');
      } catch (error) {
        console.error('Error adding custom skill:', error);
        toast.error('Failed to add custom skill. Please try again.');
      }
    }
  };

  /**
   * Remove a skill from local selection (visual feedback only)
   */
  const removeSkill = (skillName: string) => {
    setSelectedSkills(prev => prev.filter(skill => skill.name !== skillName));
  };

  /**
   * Check if a skill is currently selected
   */
  const isSkillSelected = (skillName: string) => {
    return selectedSkills.some(skill => skill.name === skillName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Add {categoryTitle} Skills</h3>
        <p className="text-sm text-muted-foreground">
          Select skills you can offer to your neighbors or add your own custom skills.
        </p>
      </div>

      {/* Selected skills display */}
      {selectedSkills.length > 0 && (
        <div className="space-y-2">
          <div className="text-center">
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {selectedSkills.length} skills added this session
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedSkills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                <span className="truncate max-w-[120px]">
                  {skill.details ? `${skill.name}: ${skill.details}` : skill.name}
                </span>
                <button
                  onClick={() => removeSkill(skill.name)}
                  className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Skills grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
        {categorySkills.map((skill) => {
          const selected = isSkillSelected(skill);
          return (
            <div
              key={skill}
              className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
                selected ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
              onClick={() => handleSkillSelect(skill)}
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selected}
                  onChange={() => {}} // Handled by parent div click
                />
                <span className="text-sm font-medium truncate">{skill}</span>
                {SPECIAL_SKILLS[skill as keyof typeof SPECIAL_SKILLS] && (
                  <Badge variant="outline" className="text-xs px-1 py-0">Details</Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced custom skill input */}
      <div className="space-y-3 border-t pt-4">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">Don't see your skill?</p>
        </div>
        
        {!showCustomInput ? (
          <Button
            variant="outline"
            onClick={() => setShowCustomInput(true)}
            className="w-full flex items-center gap-2 border-dashed border-2 border-green-300 text-green-700 hover:bg-green-50"
          >
            <Plus className="h-4 w-4" />
            Add Custom {categoryTitle} Skill
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder={`Enter your custom ${categoryTitle.toLowerCase()} skill...`}
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSkillAdd()}
                className="flex-1"
                autoFocus
              />
              <Button 
                onClick={handleCustomSkillAdd} 
                disabled={!customSkillInput.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomSkillInput('');
                }}
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter or click the check mark to add your custom skill
            </p>
          </div>
        )}
      </div>

      {/* Special skill details dialog */}
      <Dialog open={specialSkillDialog.isOpen} onOpenChange={(open) => 
        setSpecialSkillDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Details for {specialSkillDialog.skillName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">
                {SPECIAL_SKILLS[specialSkillDialog.skillName as keyof typeof SPECIAL_SKILLS]?.prompt}
              </Label>
              <Input
                placeholder={SPECIAL_SKILLS[specialSkillDialog.skillName as keyof typeof SPECIAL_SKILLS]?.placeholder}
                value={specialSkillDialog.details}
                onChange={(e) => setSpecialSkillDialog(prev => ({ ...prev, details: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => 
              setSpecialSkillDialog({ isOpen: false, skillName: '', details: '' })
            }>
              Cancel
            </Button>
            <Button 
              onClick={handleSpecialSkillConfirm}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillsPageSelector;
