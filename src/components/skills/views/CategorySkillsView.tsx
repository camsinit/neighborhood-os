
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft, Users, Plus } from 'lucide-react';
import CategorySkillsList from './CategorySkillsList';
import SkillsPageSelector from '@/components/skills/SkillsPageSelector';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';

/**
 * CategorySkillsView - Displays skills within a specific category
 * 
 * This component shows the skills list for a selected category with
 * navigation controls and the ability to add new skills.
 * Now includes the skills page selector for empty categories.
 */
interface CategorySkillsViewProps {
  category: string;
  getTypedCategory: (categoryString: string | null) => SkillCategory | undefined;
  handleBackToCategories: () => void;
  setIsSkillDialogOpen: (open: boolean) => void;
}

const CategorySkillsView: React.FC<CategorySkillsViewProps> = ({
  category,
  getTypedCategory,
  handleBackToCategories,
  setIsSkillDialogOpen
}) => {
  const user = useUser();
  const [showSkillSelector, setShowSkillSelector] = useState(false);

  // Helper function to format category name for display
  const getCategoryDisplayName = (categoryName: SkillCategory) => {
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  };

  const typedCategory = getTypedCategory(category);
  
  if (!typedCategory) {
    return null;
  }

  // Check if category has any skills
  const { data: categoryHasSkills, isLoading: checkingSkills, refetch: refetchSkillsCheck } = useQuery({
    queryKey: ['category-has-skills', typedCategory, user?.id],
    queryFn: async () => {
      if (!user) return false;

      // Get user's neighborhood
      const { data: userNeighborhood } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!userNeighborhood) return false;

      // Check if category has any skills
      const { data: skills, error } = await supabase
        .from('skills_exchange')
        .select('id')
        .eq('neighborhood_id', userNeighborhood.neighborhood_id)
        .eq('skill_category', typedCategory)
        .eq('request_type', 'offer')
        .eq('is_archived', false)
        .limit(1);

      if (error) throw error;
      return (skills?.length || 0) > 0;
    },
    enabled: !!user && !!typedCategory
  });

  // Handle skill added callback
  const handleSkillAdded = () => {
    refetchSkillsCheck(); // Refresh the check
    setShowSkillSelector(false); // Hide selector
  };

  // Show skill selector view
  if (showSkillSelector) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowSkillSelector(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {getCategoryDisplayName(typedCategory)} Skills
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">
              Add {getCategoryDisplayName(typedCategory)} Skills
            </h2>
          </div>
        </div>
        
        {/* Skills selector component */}
        <SkillsPageSelector
          selectedCategory={typedCategory}
          onSkillAdded={handleSkillAdded}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button, title, and add skill button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleBackToCategories}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">
            {getCategoryDisplayName(typedCategory)} Skills
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Add guided skill selection button */}
          <Button 
            variant="outline"
            className="whitespace-nowrap flex items-center gap-1.5 border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => setShowSkillSelector(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Browse & Add Skills</span>
          </Button>
          
          {/* Original add skill button */}
          <Button 
            className="whitespace-nowrap flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white shrink-0"
            onClick={() => setIsSkillDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Custom Skill</span>
          </Button>
        </div>
      </div>
      
      {/* Show empty state with guided selection or skills list */}
      {checkingSkills ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">Checking for skills...</p>
          </div>
        </div>
      ) : !categoryHasSkills ? (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              No {getCategoryDisplayName(typedCategory)} Skills Yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Be the first to share your {typedCategory} skills with your neighbors! 
              Choose from common skills or add your own custom skills.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button 
              onClick={() => setShowSkillSelector(true)}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Browse & Add Skills
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsSkillDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Custom Skill
            </Button>
          </div>
        </div>
      ) : (
        // Show skills list when category has skills
        <CategorySkillsList selectedCategory={typedCategory} />
      )}
    </div>
  );
};

export default CategorySkillsView;
