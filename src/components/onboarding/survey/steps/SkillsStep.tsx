
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SKILL_CATEGORIES } from './skills/skillCategories';
import { SkillCategory } from './skills/SkillCategory';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

/**
 * SkillsStep component for the onboarding survey
 * 
 * This component allows users to:
 * 1. Select skills from predefined categories
 * 2. Add custom skills that aren't in the lists
 * 3. View their selected skills
 * 
 * @param selectedSkills - Array of currently selected skills
 * @param onSkillsChange - Function to update skills in parent component
 */
export const SkillsStep = ({ 
  selectedSkills = [], 
  onSkillsChange 
}: { 
  selectedSkills: string[]; 
  onSkillsChange: (skills: string[]) => void;
}) => {
  // State to track the custom skill input value
  const [customSkill, setCustomSkill] = useState<string>('');
  
  // Categories for the tabs
  const categoryKeys = Object.keys(SKILL_CATEGORIES);
  
  // Handler for adding custom skills
  const handleAddCustomSkill = () => {
    // Only add if the skill isn't empty and isn't already selected
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      onSkillsChange([...selectedSkills, customSkill.trim()]);
      setCustomSkill(''); // Reset input after adding
    }
  };

  return (
    <div className="space-y-6">
      {/* Instruction text */}
      <p className="text-sm text-muted-foreground">
        Select skills you'd like to share with your neighbors. These help build community connections.
      </p>
      
      {/* Custom skill input */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Add a custom skill..."
          value={customSkill}
          onChange={(e) => setCustomSkill(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustomSkill();
            }
          }}
        />
        <Button 
          type="button" 
          size="sm" 
          onClick={handleAddCustomSkill}
          disabled={!customSkill.trim()}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      {/* Categorized skills selection */}
      <Tabs defaultValue={categoryKeys[0]}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-2">
          {categoryKeys.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs md:text-sm">
              {SKILL_CATEGORIES[category].title}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <ScrollArea className="h-[240px] border rounded-md p-4">
          {categoryKeys.map((category) => (
            <TabsContent key={category} value={category} className="mt-0 pt-1">
              <SkillCategory
                title={SKILL_CATEGORIES[category].title}
                skills={SKILL_CATEGORIES[category].skills}
                selectedSkills={selectedSkills}
                onSkillsChange={onSkillsChange}
              />
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
      
      {/* Selected skills count */}
      <div className="text-sm text-muted-foreground">
        {selectedSkills.length === 0 ? (
          <p>No skills selected yet. Select at least one skill to continue.</p>
        ) : (
          <p>You've selected {selectedSkills.length} {selectedSkills.length === 1 ? 'skill' : 'skills'}.</p>
        )}
      </div>
    </div>
  );
};
