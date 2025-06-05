
import React, { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { SkillCategory } from './types/skillTypes';
import { SKILL_CATEGORIES } from '@/components/onboarding/survey/steps/skills/skillCategories';

/**
 * SimpleSkillRequestPopover - Basic skill request form in a dialog
 * 
 * This component provides a simple interface for neighbors to request skills
 * with just a skill title (2-5 words) and category selection.
 * 
 * Updated to use Dialog instead of Popover for better UX consistency with Add Skill dialog.
 * Now uses the standardized skill categories from the onboarding system.
 */
interface SimpleSkillRequestPopoverProps {
  children: React.ReactNode;
}

// Generate skill categories from the onboarding system instead of hardcoded list
const SKILL_CATEGORY_OPTIONS: { value: SkillCategory; label: string }[] = 
  Object.entries(SKILL_CATEGORIES).map(([key, categoryData]) => ({
    value: key as SkillCategory,
    label: categoryData.title
  }));

const SimpleSkillRequestPopover: React.FC<SimpleSkillRequestPopoverProps> = ({ children }) => {
  const user = useUser();
  const [open, setOpen] = useState(false);
  const [skillTitle, setSkillTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission to create a skill request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!skillTitle.trim()) {
      toast.error('Please enter a skill title');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    // Validate skill title length (2-5 words)
    const wordCount = skillTitle.trim().split(/\s+/).length;
    if (wordCount < 2 || wordCount > 5) {
      toast.error('Skill title should be 2-5 words');
      return;
    }

    if (!user) {
      toast.error('Please log in to request skills');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user's neighborhood
      const { data: userNeighborhood, error: neighborhoodError } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (neighborhoodError || !userNeighborhood) {
        toast.error('Unable to find your neighborhood');
        return;
      }

      // Create the skill request in the database
      // Fixed: Use 'need' instead of 'request' to match database constraint
      const { error: insertError } = await supabase
        .from('skills_exchange')
        .insert({
          user_id: user.id,
          neighborhood_id: userNeighborhood.neighborhood_id,
          title: skillTitle.trim(),
          skill_category: selectedCategory as SkillCategory,
          request_type: 'need', // Fixed: use 'need' not 'request'
          description: `Looking for help with ${skillTitle.trim()}`,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        });

      if (insertError) {
        console.error('Error creating skill request:', insertError);
        toast.error('Failed to create skill request. Please try again.');
        return;
      }

      // Success - reset form and close dialog
      toast.success('Skill request created successfully!');
      setSkillTitle('');
      setSelectedCategory('');
      setOpen(false);

    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Skill</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ask your neighbors for help with something specific.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Skill title input field */}
            <div className="space-y-2">
              <Label htmlFor="skill-title">What do you need help with?</Label>
              <Input
                id="skill-title"
                value={skillTitle}
                onChange={(e) => setSkillTitle(e.target.value)}
                placeholder="e.g., Computer repair, Garden help"
                maxLength={50}
              />
              <p className="text-xs text-gray-500">
                Keep it short: 2-5 words describing what you need
              </p>
            </div>

            {/* Category selection dropdown using standardized categories */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
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

            {/* Form action buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Request Skill'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleSkillRequestPopover;
