import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { SkillWithProfile, SkillCategory } from "../types/skillTypes";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS, getInvalidationKeys } from "@/utils/queryKeys";

/**
 * SkillEditDialog - Modal form for editing skill details
 * 
 * This component provides a form to edit basic skill information:
 * - Title (required)
 * - Description (optional) 
 * - Category (required)
 * 
 * Note: Availability and time preferences have been removed as requested.
 */
interface SkillEditDialogProps {
  skill: SkillWithProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const SkillEditDialog = ({ skill, open, onOpenChange, onSuccess }: SkillEditDialogProps) => {
  // Form state for basic skill information
  const [title, setTitle] = useState(skill.title);
  const [description, setDescription] = useState(skill.description || '');
  const [category, setCategory] = useState<SkillCategory>(skill.skill_category as SkillCategory);
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks for data operations
  const user = useUser();
  const queryClient = useQueryClient();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (!category) {
      toast.error("Category is required");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to update skills");
      return;
    }

    setIsLoading(true);

    try {
      // Update the skill using Supabase directly
      const { error } = await supabase
        .from('skills_exchange')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          skill_category: category
        })
        .eq('id', skill.id)
        .eq('user_id', user.id); // Ensure user can only update their own skills

      if (error) {
        throw error;
      }

      // Invalidate queries to refresh the skill list
      const invalidationKeys = getInvalidationKeys('SKILLS');
      invalidationKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      toast.success("Skill updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating skill:', error);
      toast.error("Failed to update skill");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when opening/closing
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form to original values when closing
      setTitle(skill.title);
      setDescription(skill.description || '');
      setCategory(skill.skill_category as SkillCategory);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Skill</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What skill are you offering or requesting?"
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about this skill..."
              className="min-h-[100px]"
            />
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(value: SkillCategory) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="care">Care</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SkillEditDialog;