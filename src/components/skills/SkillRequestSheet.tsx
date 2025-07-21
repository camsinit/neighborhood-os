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
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-lg font-semibold text-gray-900">
            Request Help from Neighbors
          </SheetTitle>
          <p className="text-sm text-gray-600">
            Let your neighbors know what you need help with. Be specific about your requirements
            so the right person can reach out to assist you.
          </p>
        </SheetHeader>

        <Separator className="my-6" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skill title input - kept concise for easy browsing */}
          <div className="space-y-2">
            <Label htmlFor="skill-title" className="text-sm font-medium text-gray-700">
              What do you need help with? <span className="text-red-500">*</span>
            </Label>
            <Input
              id="skill-title"
              value={skillTitle}
              onChange={(e) => setSkillTitle(e.target.value)}
              placeholder="e.g., Computer repair, Garden help"
              maxLength={50}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Keep it short and clear: 2-5 words describing what you need
            </p>
          </div>

          {/* Category selection using standardized categories */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select the most relevant category" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {SKILL_CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Choose the category that best matches your request
            </p>
          </div>

          <Separator />

          {/* NEW: Details section for comprehensive information */}
          <div className="space-y-2">
            <Label htmlFor="skill-details" className="text-sm font-medium text-gray-700">
              Details <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="skill-details"
              value={skillDetails}
              onChange={(e) => setSkillDetails(e.target.value)}
              placeholder="Please provide more details about what you need help with. For example:
• What specific task or problem needs to be solved?
• What level of experience or expertise is needed?
• Any time constraints or preferences?
• What materials or tools do you have available?
• Any other relevant information that would help someone assist you?"
              className="w-full min-h-[120px] resize-y"
              maxLength={1000}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Provide context to help neighbors understand your specific needs</span>
              <span>{skillDetails.length}/1000</span>
            </div>
          </div>

          {/* Form action buttons */}
          <Separator />
          
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !skillTitle.trim() || !selectedCategory || !skillDetails.trim()}
              className="px-6 bg-green-500 hover:bg-green-600 text-white"
            >
              {isSubmitting ? 'Creating Request...' : 'Request Help'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default SkillRequestSheet;