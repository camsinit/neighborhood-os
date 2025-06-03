
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Plus, Check, ChevronRight, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SKILL_CATEGORIES, SPECIAL_SKILLS } from '@/components/onboarding/survey/steps/skills/skillCategories';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import { useSkillsExchange } from '@/hooks/skills/useSkillsExchange';
import { toast } from 'sonner';

/**
 * Enhanced SkillsPageSelector - Now supports both single and multi-category modes
 * 
 * This component provides a guided skill selection experience that can work in:
 * 1. Single category mode (when opened from a specific category view)
 * 2. Multi-category mode (when opened from the main skills page)
 * 
 * In multi-category mode, users first select a category, then see skills for that category.
 * All skills are immediately saved to the database when selected.
 */
interface SkillsPageSelectorProps {
  selectedCategory?: SkillCategory; // Optional - if provided, single category mode
  onSkillAdded: () => void; // Callback when a skill is successfully added
  multiCategoryMode?: boolean; // Enable category selection first
}

interface SelectedSkill {
  name: string;
  details?: string;
  category: SkillCategory;
}

const SkillsPageSelector: React.FC<SkillsPageSelectorProps> = ({
  selectedCategory,
  onSkillAdded,
  multiCategoryMode = false
}) => {
  // Track selected skills for this session
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  
  // Multi-category mode state
  const [currentCategory, setCurrentCategory] = useState<SkillCategory | null>(
    selectedCategory || null
  );
  const [showCategorySelection, setShowCategorySelection] = useState(
    multiCategoryMode && !selectedCategory
  );
  
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

  // Get available categories for multi-category mode
  const availableCategories = Object.entries(SKILL_CATEGORIES).map(([key, value]) => ({
    key: key as SkillCategory,
    title: value.title,
    description: value.description || `${value.title} related skills`
  }));

  // Get skills for the current category
  const categorySkills = currentCategory ? SKILL_CATEGORIES[currentCategory]?.skills || [] : [];
  const categoryTitle = currentCategory ? SKILL_CATEGORIES[currentCategory]?.title || currentCategory : '';

  /**
   * Handle category selection in multi-category mode
   */
  const handleCategorySelect = (category: SkillCategory) => {
    setCurrentCategory(category);
    setShowCategorySelection(false);
  };

  /**
   * Go back to category selection
   */
  const handleBackToCategories = () => {
    setCurrentCategory(null);
    setShowCategorySelection(true);
    setShowCustomInput(false);
    setCustomSkillInput('');
  };

  /**
   * Handle skill selection toggle
   */
  const handleSkillSelect = async (skillName: string) => {
    if (!currentCategory) return;
    
    const isSelected = selectedSkills.some(skill => 
      skill.name === skillName && skill.category === currentCategory
    );
    
    if (isSelected) {
      // Remove skill from local selection
      setSelectedSkills(prev => prev.filter(skill => 
        !(skill.name === skillName && skill.category === currentCategory)
      ));
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
            category: currentCategory,
            description: `${skillName} skill`
          }, 'offer');
          
          // Add to local selection for UI feedback
          setSelectedSkills(prev => [...prev, { 
            name: skillName, 
            category: currentCategory 
          }]);
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
    if (specialSkillDialog.skillName && specialSkillDialog.details.trim() && currentCategory) {
      try {
        await handleSubmit({
          title: specialSkillDialog.skillName,
          category: currentCategory,
          description: specialSkillDialog.details.trim()
        }, 'offer');
        
        // Add to local selection
        setSelectedSkills(prev => [...prev, { 
          name: specialSkillDialog.skillName, 
          details: specialSkillDialog.details.trim(),
          category: currentCategory
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
    if (customSkillInput.trim() && currentCategory) {
      try {
        await handleSubmit({
          title: customSkillInput.trim(),
          category: currentCategory,
          description: `Custom ${customSkillInput.trim()} skill`
        }, 'offer');
        
        // Add to local selection
        setSelectedSkills(prev => [...prev, { 
          name: customSkillInput.trim(),
          category: currentCategory
        }]);
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
  const removeSkill = (skillName: string, category: SkillCategory) => {
    setSelectedSkills(prev => prev.filter(skill => 
      !(skill.name === skillName && skill.category === category)
    ));
  };

  /**
   * Check if a skill is currently selected
   */
  const isSkillSelected = (skillName: string) => {
    return selectedSkills.some(skill => 
      skill.name === skillName && skill.category === currentCategory
    );
  };

  // Render category selection view
  if (showCategorySelection) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Choose a Skill Category</h3>
          <p className="text-sm text-muted-foreground">
            Select a category to see available skills you can offer to your neighbors.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {availableCategories.map((category) => (
            <div
              key={category.key}
              className="p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 hover:border-green-500"
              onClick={() => handleCategorySelect(category.key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{category.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Session summary */}
        {selectedSkills.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <div className="text-center">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {selectedSkills.length} skills added this session
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1 text-xs">
                  <span className="truncate max-w-[100px]">
                    {skill.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({SKILL_CATEGORIES[skill.category]?.title})
                  </span>
                  <button
                    onClick={() => removeSkill(skill.name, skill.category)}
                    className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render skill selection view (existing functionality)
  return (
    <div className="space-y-6">
      {/* Header with back button for multi-category mode */}
      <div className="space-y-2">
        {multiCategoryMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToCategories}
            className="mb-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Categories
          </Button>
        )}
        <div className="text-center">
          <h3 className="text-lg font-semibold">Add {categoryTitle} Skills</h3>
          <p className="text-sm text-muted-foreground">
            Select skills you can offer to your neighbors or add your own custom skills.
          </p>
        </div>
      </div>

      {/* Selected skills display */}
      {selectedSkills.filter(skill => skill.category === currentCategory).length > 0 && (
        <div className="space-y-2">
          <div className="text-center">
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {selectedSkills.filter(skill => skill.category === currentCategory).length} skills added from this category
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedSkills
              .filter(skill => skill.category === currentCategory)
              .map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                  <span className="truncate max-w-[120px]">
                    {skill.details ? `${skill.name}: ${skill.details}` : skill.name}
                  </span>
                  <button
                    onClick={() => removeSkill(skill.name, skill.category)}
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
