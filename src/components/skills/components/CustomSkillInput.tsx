
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Check } from 'lucide-react';

/**
 * CustomSkillInput - Component for adding custom skills
 * Allows users to add skills that aren't in the predefined list
 */
interface CustomSkillInputProps {
  categoryTitle: string;
  onAddCustomSkill: (skillName: string) => void;
}

const CustomSkillInput: React.FC<CustomSkillInputProps> = ({
  categoryTitle,
  onAddCustomSkill
}) => {
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCustomSkillAdd = () => {
    if (customSkillInput.trim()) {
      onAddCustomSkill(customSkillInput.trim());
      setCustomSkillInput('');
      setShowCustomInput(false);
    }
  };

  return (
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
  );
};

export default CustomSkillInput;
