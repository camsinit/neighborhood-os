
import { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { SKILL_CATEGORIES } from './skills/skillCategories';
import { SkillCategory } from './skills/SkillCategory';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

/**
 * SkillsStep component for the onboarding survey
 * 
 * This component allows users to:
 * 1. Select skills from predefined categories using a simplified one-direction carousel navigation
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
  const nextCategoryName = isLastCategory 
    ? SKILL_CATEGORIES[categoryKeys[0]].title  // Loop back to first category
    : SKILL_CATEGORIES[categoryKeys[currentCategoryIndex + 1]].title;
  
  return <div className="space-y-6">
      {/* Custom skill input */}
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Add a custom skill..." 
          value={customSkill} 
          onChange={e => setCustomSkill(e.target.value)} 
          className={`flex-1 ${customSkillTextColorClass}`} 
          onKeyDown={e => {
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
      
      {/* Skills Carousel */}
      <div className="border rounded-md p-4">
        <Carousel 
          className="w-full"
          setApi={setApi} // Connect the Carousel API to our state
          opts={{
            align: "start",
          }}
        >
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
            {categoryKeys.map((category, index) => (
              <CarouselItem key={category} className="h-full">
                <div className="h-full overflow-auto">
                  <SkillCategory 
                    title={SKILL_CATEGORIES[category].title} 
                    skills={SKILL_CATEGORIES[category].skills} 
                    selectedSkills={selectedSkills} 
                    onSkillsChange={onSkillsChange} 
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        {/* Single Continue button for advancing through categories */}
        <div className="flex justify-end mt-4">
          <Button 
            size="sm" 
            onClick={handleContinueToNextCategory} 
            className="flex items-center"
            variant="light" // Using the light variant for a softer look
          >
            Continue to {nextCategoryName}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      {/* Selected skills count */}
      <div className="text-sm text-muted-foreground">
        {selectedSkills.length === 0 ? 
          <p>No skills selected yet. Select at least one skill to continue.</p> : 
          <p>You've selected {selectedSkills.length} {selectedSkills.length === 1 ? 'skill' : 'skills'}.</p>}
      </div>
    </div>;
};
