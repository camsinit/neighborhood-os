
// This is the main skill form component that uses smaller, focused components
// to create a form for offering or requesting skills

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useSkills } from "@/contexts/SkillsContext";
import { useToast } from "@/hooks/use-toast";
import { useSkillDuplicateCheck } from "@/hooks/skills/useSkillDuplicateCheck";
import { SkillCategory } from "./types/skillTypes";
import { SkillFormData, SkillFormProps, TimePreference } from "./types/skillFormTypes";

// Import the individual form field components
import CategoryField from "./form/CategoryField";
import TitleField from "./form/TitleField";
import DescriptionField from "./form/DescriptionField";
import AvailabilityField from "./form/AvailabilityField";
import TimePreferenceField from "./form/TimePreferenceField";

/**
 * The main SkillForm component that allows users to offer or request skills
 * 
 * This component has been refactored to use smaller, focused components
 * for each part of the form. Reduced toast notifications to essential only.
 */
const SkillForm = ({ onClose, mode }: SkillFormProps) => {
  // State to store form data and validation errors
  const [formData, setFormData] = useState<SkillFormData>({
    category: 'technology',
    timePreference: [],
  });
  
  const [errors, setErrors] = useState<{
    category?: string;
    title?: string;
    description?: string;
  }>({});
  
  // Custom hooks for toast and skill submission
  const { toast } = useToast();
  const { createSkill } = useSkills();

  // Check for duplicate skills
  const { data: duplicates, isLoading: checkingDuplicates } = useSkillDuplicateCheck(formData, mode);

  /**
   * Validate form data and return any errors
   */
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.category) {
      newErrors.category = "Please select a skill category";
    }
    
    if (!formData.title?.trim()) {
      newErrors.title = "Skill title is required";
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = "Skill description is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission with inline validation
   */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form and show inline errors
    if (!validateForm()) {
      return;
    }

    console.log("[SkillForm] Submitting form:", { formData, mode });
    
    try {
      // Submit the form data - convert 'request' to 'need' for database compatibility
      const dbMode = mode === 'request' ? 'need' : mode;
      await createSkill(formData, dbMode as 'offer' | 'need');
      onClose(); // Close form on success
      console.log("[SkillForm] Form submitted successfully");
    } catch (error) {
      console.error("[SkillForm] Error submitting form:", error);
      // Only show toast for unexpected errors
      toast({
        title: "Failed to submit skill",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  /**
   * Handle time preference changes
   */
  const handleTimePreferenceChange = (value: string) => {
    setFormData(prev => {
      const currentPreferences = prev.timePreference || [];
      const newPreferences = currentPreferences.includes(value as TimePreference)
        ? currentPreferences.filter(p => p !== value)
        : [...currentPreferences, value as TimePreference];
      return { ...prev, timePreference: newPreferences };
    });
  };

  /**
   * Update any form field value and clear related errors
   */
  const updateField = <K extends keyof SkillFormData>(field: K, value: SkillFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Category selection field */}
      <CategoryField 
        value={formData.category} 
        onChange={(value) => updateField('category', value)}
        error={errors.category}
      />

      {/* Title input field with duplicate warning and inline error */}
      <TitleField 
        mode={mode} 
        value={formData.title} 
        onChange={(value) => updateField('title', value)}
        duplicateWarning={duplicates && duplicates.length > 0 
          ? `Similar ${mode === 'offer' ? 'offerings' : 'requests'} exist in this category` 
          : null
        }
        error={errors.title}
      />

      {/* Description textarea with inline error */}
      <DescriptionField 
        mode={mode} 
        value={formData.description} 
        onChange={(value) => updateField('description', value)}
        error={errors.description}
      />

      {/* Only show availability options for skill offers */}
      {mode === 'offer' && (
        <>
          {/* Availability dropdown */}
          <AvailabilityField 
            value={formData.availability} 
            onChange={(value) => updateField('availability', value as 'weekdays' | 'weekends' | 'both')}
          />

          {/* Time preference selection */}
          <TimePreferenceField 
            values={formData.timePreference || []} 
            onChange={handleTimePreferenceChange}
          />
        </>
      )}

      {/* Form submit button */}
      <DialogFooter>
        <Button type="submit">
          {mode === 'offer' ? 'Offer Skill' : 'Request Skill'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SkillForm;
