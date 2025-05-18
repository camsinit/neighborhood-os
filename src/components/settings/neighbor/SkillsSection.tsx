
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileFormValues } from "../types";
import { useNeighborTabForm } from "../hooks/useNeighborTabForm";

/**
 * Skills section for the Neighbor tab
 * 
 * Allows users to add and remove skills to their profile
 * 
 * @param form - The form instance from react-hook-form
 */
export const SkillsSection = ({
  form
}: {
  form: UseFormReturn<ProfileFormValues>;
}) => {
  // Use the dedicated hook for neighbor tab functionality
  const {
    skillCategories,
    addSkill,
    removeSkill
  } = useNeighborTabForm(form);
  
  // Get the current skills from the form
  const skills = form.watch('skills') || [];
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Skills</h3>
        <p className="text-sm text-muted-foreground">
          Add skills that you can offer to your community.
        </p>
      </div>
      
      {/* Skill selection dropdown */}
      <FormField
        control={form.control}
        name="skills"
        render={() => (
          <FormItem>
            <FormLabel>Add a skill</FormLabel>
            <Select 
              onValueChange={addSkill}
              defaultValue=""
            >
              <FormDescription>
                Select skills you want to share with your community
              </FormDescription>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a skill category" />
              </SelectTrigger>
              <SelectContent>
                {skillCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {/* Capitalize first letter of each category */}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
              <FormMessage />
            </Select>
          </FormItem>
        )}
      />
      
      {/* Display selected skills as badges */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {/* Capitalize first letter of each skill */}
              {skill.charAt(0).toUpperCase() + skill.slice(1)}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 rounded-full"
                onClick={() => removeSkill(index)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {skill}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
