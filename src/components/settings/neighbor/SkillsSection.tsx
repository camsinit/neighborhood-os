
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
  const { skillCategories, addSkill, removeSkill } = useNeighborTabForm(form);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Skills & Expertise</h3>
      <FormField 
        control={form.control} 
        name="skills" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your Skills</FormLabel>
            <div className="space-y-2">
              {/* Skill selection dropdown */}
              <Select 
                onValueChange={value => addSkill(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add a skill..." />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Display selected skills as badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                {(field.value || []).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 hover:bg-transparent" 
                      onClick={() => removeSkill(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
            <FormDescription>
              Skills you've contributed or selected will appear here.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
  );
};
