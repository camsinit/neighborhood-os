import React, { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet } from '@/components/ui/sheet';
import { AppSheetContent } from '@/components/ui/app-sheet-content';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { SkillCategory } from './types/skillTypes';
import { SKILL_CATEGORIES } from '@/components/onboarding/survey/steps/skills/skillCategories';
import { MessageSquare } from 'lucide-react';
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

    // Validate skill title length (1-5 words for requests to allow simple needs)
    const wordCount = skillTitle.trim().split(/\s+/).length;
    if (wordCount < 1 || wordCount > 5) {
      toast.error('Skill title should be 1-5 words');
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
      <AppSheetContent 
        side="right" 
        moduleTheme="skills"
      >
        <SheetHeader className="border-b border-border/40 pb-4">
          <SheetTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5" style={{ color: moduleThemeColors.skills.primary }} />
            Request Help from Neighbors
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-4">
            Let your neighbors know what you need help with. Be specific about your requirements
            so the right person can reach out to assist you.
          </p>
          <div className="w-full max-w-sm mx-auto">
            <form onSubmit={handleSubmit} className="space-y-3">
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
                className="hover:opacity-90 text-white"
              >
                {isSubmitting ? 'Creating Request...' : 'Request Help'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppSheetContent>
    </Sheet>
  );
};

export default SkillRequestSheet;