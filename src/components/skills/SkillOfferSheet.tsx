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
import { HandHeart } from 'lucide-react';
import { moduleThemeColors } from '@/theme/moduleTheme';

/**
 * SkillOfferSheet - Form for offering skills to neighbors
 * 
 * This component provides a form interface for neighbors to offer their skills
 * with a title, category, and detailed description of what they can help with.
 * 
 * Follows the same design pattern as SkillRequestSheet for consistency.
 */
interface SkillOfferSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSkillAdded?: () => void; // Callback when a skill is successfully added
}

// Generate skill categories from the onboarding system
const SKILL_CATEGORY_OPTIONS: { value: SkillCategory; label: string }[] = 
  Object.entries(SKILL_CATEGORIES).map(([key, categoryData]) => ({
    value: key as SkillCategory,
    label: categoryData.title
  }));

const SkillOfferSheet: React.FC<SkillOfferSheetProps> = ({ 
  open, 
  onOpenChange, 
  onSkillAdded 
}) => {
  const user = useUser();
  
  // Form state management - matching the request form structure
  const [skillTitle, setSkillTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [skillDescription, setSkillDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Reset form fields to their initial empty state
   */
  const resetForm = () => {
    setSkillTitle('');
    setSelectedCategory('');
    setSkillDescription('');
  };

  /**
   * Handle form submission to create a skill offer with validation
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

    if (!skillDescription.trim()) {
      toast.error('Please describe your experience and how you can help');
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
      toast.error('Please log in to offer skills');
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

      // Create the skill offer in the database
      // Using 'offer' as request_type to indicate this is a skill being offered
      const { error: insertError } = await supabase
        .from('skills_exchange')
        .insert({
          user_id: user.id,
          neighborhood_id: userNeighborhood.neighborhood_id,
          title: skillTitle.trim(),
          skill_category: selectedCategory as SkillCategory,
          request_type: 'offer', // Database expects 'offer' for skill offers
          description: skillDescription.trim(),
          valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now
        });

      if (insertError) {
        console.error('Error creating skill offer:', insertError);
        toast.error('Failed to create skill offer. Please try again.');
        return;
      }

      // Success - reset form, close sheet, and show success message
      toast.success('Skill offer created successfully! Your neighbors can now reach out to you.');
      resetForm();
      onOpenChange(false);
      
      // Call the callback to refresh the skills list
      if (onSkillAdded) {
        onSkillAdded();
      }

    } catch (error) {
      console.error('Unexpected error creating skill offer:', error);
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
            <HandHeart className="h-5 w-5" style={{ color: moduleThemeColors.skills.primary }} />
            Offer Your Skills
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-4">
            Share your knowledge and skills with your neighbors. Be specific about your experience
            and how you can help others learn and grow.
          </p>
          <div className="w-full max-w-sm mx-auto">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Skill title input */}
              <div className="space-y-1">
                <Label htmlFor="skill-title">What skill can you offer?</Label>
                <Input
                  id="skill-title"
                  value={skillTitle}
                  onChange={(e) => setSkillTitle(e.target.value)}
                  placeholder="e.g., Web Design, Guitar Lessons"
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

              {/* Description section with compact styling */}
              <div className="space-y-1">
                <Label htmlFor="skill-description">Describe your experience and teaching approach</Label>
                <Textarea
                  id="skill-description"
                  value={skillDescription}
                  onChange={(e) => setSkillDescription(e.target.value)}
                  placeholder="Share your expertise level, teaching style, availability, and how you can help others learn this skill..."
                  className="min-h-[80px] w-full resize-none"
                  maxLength={1000}
                  required
                />
                <div className="text-xs text-gray-500 text-right">
                  {skillDescription.length}/1000
                </div>
              </div>

              {/* Form action buttons - matching request form style */}
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
                  disabled={isSubmitting || !skillTitle.trim() || !selectedCategory || !skillDescription.trim()}
                  style={{ 
                    backgroundColor: moduleThemeColors.skills.primary,
                    borderColor: moduleThemeColors.skills.primary 
                  }}
                  className="hover:opacity-90 text-white"
                >
                  {isSubmitting ? 'Creating Offer...' : 'Offer Skill'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AppSheetContent>
    </Sheet>
  );
};

export default SkillOfferSheet;