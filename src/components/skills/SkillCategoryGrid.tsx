
import React, { useState } from 'react';
import { SkillCategory } from './types/skillTypes';
import { useSkillsPreview } from '@/hooks/skills/useSkillsPreview';
import SkillCategoryCard from './SkillCategoryCard';
import CategorySkillsDialog from './CategorySkillsDialog';
import { Loader2 } from 'lucide-react';
import { useSkillsExchange } from '@/hooks/skills/useSkillsExchange';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';
import { toast } from 'sonner';

/**
 * Grid component that displays all skill categories with previews of available skills
 * Uses a responsive grid layout and handles loading states
 * Now uses the 6 standardized onboarding categories
 * FIXED: Now properly submits selected skills to the database
 */

interface SkillCategoryGridProps {
  onCategoryClick: (category: SkillCategory) => void;
}

const SkillCategoryGrid: React.FC<SkillCategoryGridProps> = ({ onCategoryClick }) => {
  const { data: skillsData, isLoading, error } = useSkillsPreview();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedEmptyCategory, setSelectedEmptyCategory] = useState<SkillCategory | null>(null);
  const [isSubmittingSkills, setIsSubmittingSkills] = useState(false);
  
  // Get the current neighborhood context
  const neighborhood = useCurrentNeighborhood();
  
  // Hook for submitting skills to database - this was missing!
  const { handleSubmit } = useSkillsExchange({
    onSuccess: () => {
      console.log('✅ Skill successfully added to database');
      // Refresh the skills data after successful submission
      // The useSkillsPreview hook should automatically refetch
    }
  });

  // All available skill categories - now using the 6 standardized onboarding categories
  const categories: SkillCategory[] = ['technology', 'emergency', 'professional', 'maintenance', 'care', 'education'];

  // Handle category card click - check if empty
  const handleCategoryCardClick = (category: SkillCategory) => {
    const categoryData = skillsData?.[category];
    const isEmpty = !categoryData || (categoryData.offers.length === 0 && categoryData.requests.length === 0);
    
    if (isEmpty) {
      // Show skills selection dialog for empty categories
      setSelectedEmptyCategory(category);
      setIsCategoryDialogOpen(true);
    } else {
      // Navigate to category view for categories with skills
      onCategoryClick(category);
    }
  };

  // FIXED: Handle skills selection from the category dialog - now actually submits to database
  const handleSkillsSelected = async (skills: string[]) => {
    // Validate we have everything we need
    if (!selectedEmptyCategory || !neighborhood?.id || skills.length === 0) {
      console.error('❌ Missing required data for skill submission:', {
        category: selectedEmptyCategory,
        neighborhoodId: neighborhood?.id,
        skillsCount: skills.length
      });
      toast.error('Unable to add skills. Please try again.');
      return;
    }

    console.log('🎯 Starting to submit selected skills:', {
      skills,
      category: selectedEmptyCategory,
      neighborhoodId: neighborhood.id
    });

    setIsSubmittingSkills(true);

    try {
      // Submit each selected skill individually using the existing submission system
      for (const skillName of skills) {
        console.log(`📤 Submitting skill: ${skillName} in category: ${selectedEmptyCategory}`);
        
        // Create form data for this skill
        const skillFormData = {
          title: skillName,
          category: selectedEmptyCategory,
          description: `${skillName} skill in ${selectedEmptyCategory}`
        };

        // Submit the skill as an offer using the existing hook
        await handleSubmit(skillFormData, 'offer');
        
        console.log(`✅ Successfully submitted: ${skillName}`);
      }

      // Show success message
      toast.success(`Successfully added ${skills.length} skill${skills.length > 1 ? 's' : ''} to ${selectedEmptyCategory}!`);
      
      // Close the dialog
      setIsCategoryDialogOpen(false);
      
      // Wait a moment for the database to update, then navigate to the category view
      setTimeout(() => {
        if (selectedEmptyCategory) {
          onCategoryClick(selectedEmptyCategory);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error submitting skills:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to add skills: ${errorMessage}`);
    } finally {
      setIsSubmittingSkills(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading skill categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Error loading skill categories. Please try again.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <SkillCategoryCard
            key={category}
            category={category}
            skillsData={skillsData?.[category] || { offers: [], requests: [] }}
            onClick={handleCategoryCardClick}
          />
        ))}
      </div>
      
      {/* Category Skills Selection Dialog - now properly connected to submission system */}
      <CategorySkillsDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        category={selectedEmptyCategory || 'technology'}
        onSkillsSelected={handleSkillsSelected}
        isSubmitting={isSubmittingSkills}
      />
    </>
  );
};

export default SkillCategoryGrid;
