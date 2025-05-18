import { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { SKILL_CATEGORIES } from './skills/skillCategories';
import { SkillCategory } from './skills/SkillCategory';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight, X } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * SkillsStep component for the onboarding survey
 * 
 * This component allows users to:
 * 1. Select skills from predefined categories using a simplified one-direction carousel navigation
 * 2. Add custom skills that aren't in the lists
 * 3. View their selected skills as tags/badges with the ability to remove them
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

  // State to track the current category index
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(0);

  // Create a ref for the carousel API
  const [api, setApi] = useState<any>(null);

  // Categories for the carousel
  const categoryKeys = Object.keys(SKILL_CATEGORIES);

  // Effect to sync carousel with currentCategoryIndex
  useEffect(() => {
    if (api) {
      // When currentCategoryIndex changes, tell the carousel to scroll to that index
      api.scrollTo(currentCategoryIndex);
    }
  }, [api, currentCategoryIndex]);

  // Handler for adding custom skills
  const handleAddCustomSkill = () => {
    // Only add if the skill isn't empty and isn't already selected
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      onSkillsChange([...selectedSkills, customSkill.trim()]);
      setCustomSkill(''); // Reset input after adding
    }
  };

  // Handler for removing a skill
  const handleRemoveSkill = (skillToRemove: string) => {
    // Filter out the skill to remove
    const updatedSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    onSkillsChange(updatedSkills);
  };

  // Get the current category key
  const currentCategoryKey = categoryKeys[currentCategoryIndex];

  // Determine if this is the last category
  const isLastCategory = currentCategoryIndex === categoryKeys.length - 1;

  // Handler for advancing to the next category
  const handleContinueToNextCategory = () => {
    // If we're at the last category, loop back to the first one
    const newIndex = currentCategoryIndex === categoryKeys.length - 1 ? 0 : currentCategoryIndex + 1;
    setCurrentCategoryIndex(newIndex);
  };

  // Determine text color based on input content
  const customSkillTextColorClass = customSkill.trim() ? "text-black" : "text-gray-500";

  // Determine the text for the continue button
  const nextCategoryName = isLastCategory ? SKILL_CATEGORIES[categoryKeys[0]].title // Loop back to first category
  : SKILL_CATEGORIES[categoryKeys[currentCategoryIndex + 1]].title;
  return <div className="space-y-6">
      {/* Custom skill input */}
      <div className="flex items-center space-x-2">
        <Input placeholder="Add a custom skill..." value={customSkill} onChange={e => setCustomSkill(e.target.value)} className={`flex-1 ${customSkillTextColorClass}`} onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddCustomSkill();
        }
      }} />
        <Button type="button" size="sm" onClick={handleAddCustomSkill} disabled={!customSkill.trim()}>
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      {/* Skills Carousel */}
      <div className="border rounded-md p-4">
        <Carousel className="w-full" setApi={setApi} // Connect the Carousel API to our state
      opts={{
        align: "start"
      }}>
          {/* Category title, now inside the carousel div */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">
              {SKILL_CATEGORIES[currentCategoryKey].title}
            </h3>
            <div className="text-sm text-muted-foreground">
              {currentCategoryIndex + 1} of {categoryKeys.length}
            </div>
          </div>
          
          <CarouselContent className="h-[200px]">
            {categoryKeys.map((category, index) => <CarouselItem key={category} className="h-full">
                <div className="h-full overflow-auto">
                  <SkillCategory title={SKILL_CATEGORIES[category].title} skills={SKILL_CATEGORIES[category].skills} selectedSkills={selectedSkills} onSkillsChange={onSkillsChange} />
                </div>
              </CarouselItem>)}
          </CarouselContent>
        </Carousel>
        
        {/* Single Continue button for advancing through categories */}
        <div className="flex justify-end mt-4">
          <Button size="sm" onClick={handleContinueToNextCategory} variant="light" // Using the light variant for a softer look
        className="flex items-center text-center">
            Continue to {nextCategoryName}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      {/* Selected skills display as tags */}
      <div className="space-y-2">
        {selectedSkills.length === 0 ? <p className="text-sm text-muted-foreground">No skills selected yet. Select at least one skill to continue.</p> : <div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSkills.map((skill, index) => <Badge key={index} variant="secondary" className="group relative py-1.5 pl-3 pr-8 text-sm bg-blue-50 border-blue-100 text-blue-800 hover:bg-blue-100">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove ${skill} skill`}>
                    <X className="h-3 w-3 text-blue-800" />
                  </button>
                </Badge>)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              You've selected {selectedSkills.length} {selectedSkills.length === 1 ? 'skill' : 'skills'}.
            </p>
          </div>}
      </div>
    </div>;
};