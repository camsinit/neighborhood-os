import React, { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { SkillCategory } from './types/skillTypes';
import { SKILL_CATEGORIES } from '@/components/onboarding/survey/steps/skills/skillCategories';
import { moduleThemeColors } from '@/theme/moduleTheme';

/**
 * SkillRequestSheet - Enhanced skill request form in a side panel
 * 
 * This component provides a comprehensive interface for neighbors to request skills
 * with a title, category, and detailed description of what they need help with.
 * 
 * Uses Sheet component for consistency with other side panels in the app.
 * Includes validation and proper error handling for a better user experience.
 */
interface SkillRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Generate skill categories from the onboarding system
const SKILL_CATEGORY_OPTIONS: { value: SkillCategory; label: string }[] = 
  Object.entries(SKILL_CATEGORIES).map(([key, categoryData]) => ({
    value: key as SkillCategory,
    label: categoryData.title
  }));

const SkillRequestSheet: React.FC<SkillRequestSheetProps> = ({ open, onOpenChange }) => {
  const user = useUser();
  
  // Form state management
  const [skillTitle, setSkillTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [skillDetails, setSkillDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Reset form fields to their initial empty state
   */
  const resetForm = () => {
    setSkillTitle('');
    setSelectedCategory('');
    setSkillDetails('');
  };

  /**
   * Handle form submission to create a skill request with validation
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation for required fields
    if (!skillTitle.trim()) {
      toast.error('Please enter a skill title');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    if (!skillDetails.trim()) {
      toast.error('Please provide details about what you need help with');
      return;
    }

    // Validate skill title length (2-5 words for brevity)
    const wordCount = skillTitle.trim().split(/\s+/).length;
    if (wordCount < 2 || wordCount > 5) {
      toast.error('Skill title should be 2-5 words');
      return;
    }

    // Check user authentication
    if (!user) {
      toast.error('Please log in to request skills');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user's neighborhood from membership table
      const { data: userNeighborhood, error: neighborhoodError } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (neighborhoodError || !userNeighborhood) {
        toast.error('Unable to find your neighborhood. Please ensure you\'re a member of a neighborhood.');
        return;
      }

      // Create the skill request in the database
      // Using 'need' as request_type to match database constraints
      const { error: insertError } = await supabase
        .from('skills_exchange')
        .insert({
          user_id: user.id,
          neighborhood_id: userNeighborhood.neighborhood_id,
          title: skillTitle.trim(),
          skill_category: selectedCategory as SkillCategory,
          request_type: 'need', // Database expects 'need' for skill requests
          description: skillDetails.trim(),
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        });

      if (insertError) {
        console.error('Error creating skill request:', insertError);
        toast.error('Failed to create skill request. Please try again.');
        return;
      }

      // Success - reset form, close sheet, and show success message
      toast.success('Skill request created successfully! Your neighbors will be notified.');
      resetForm();
      onOpenChange(false);

    } catch (error) {
      console.error('Unexpected error creating skill request:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle sheet close with form reset
   */
  const handleClose = (open: boolean) => {
    if (!open && !isSubmitting) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent 
        side="right" 
        className="w-[400px] sm:w-[540px] overflow-y-auto"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: moduleThemeColors.skills.primary + '40',
          boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px ${moduleThemeColors.skills.primary}10`
        }}
      >
        <SheetHeader className="space-y-3">
          <SheetTitle className="text-lg font-semibold text-gray-900">
            Request Help from Neighbors
          </SheetTitle>
          <p className="text-sm text-gray-600">
            Let your neighbors know what you need help with. Be specific about your requirements
            so the right person can reach out to assist you.
          </p>
        </SheetHeader>

        <div className="w-full max-w-sm mx-auto mt-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Skill title input - compact styling like goods form */}
            <div className="space-y-1">
              <Label htmlFor="skill-title">What do you need help with?</Label>
              <Input
                id="skill-title"
                value={skillTitle}
                onChange={(e) => setSkillTitle(e.target.value)}
                placeholder="e.g., Computer repair, Garden help"
                maxLength={50}
                required
                className="w-full"
              />
            </div>

            {/* Category selection using compact styling */}
            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {SKILL_CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Details section with compact styling */}
            <div className="space-y-1">
              <Label htmlFor="skill-details">Details</Label>
              <Textarea
                id="skill-details"
                value={skillDetails}
                onChange={(e) => setSkillDetails(e.target.value)}
                placeholder="Describe what you need help with, any time constraints, level of expertise needed, etc."
                className="min-h-[80px] w-full resize-none"
                maxLength={1000}
                required
              />
              <div className="text-xs text-gray-500 text-right">
                {skillDetails.length}/1000
              </div>
            </div>

            {/* Form action buttons - matching goods form style */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !skillTitle.trim() || !selectedCategory || !skillDetails.trim()}
                style={{ 
                  backgroundColor: moduleThemeColors.skills.primary,
                  borderColor: moduleThemeColors.skills.primary 
                }}
                className="hover:opacity-90"
              >
                {isSubmitting ? 'Creating Request...' : 'Request Help'}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SkillRequestSheet;