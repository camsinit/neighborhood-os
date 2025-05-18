
// This is the main skill form component that uses smaller, focused components
// to create a form for offering or requesting skills

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useSkillsExchange } from "@/hooks/skills/useSkillsExchange";
import { useToast } from "@/hooks/use-toast";
import { useSkillDuplicateCheck } from "@/hooks/skills/useSkillDuplicateCheck";
import { SkillCategory } from "./types/skillTypes";
import { SkillFormData, TimePreference } from "./types/skillFormTypes";

// Import the individual form field components
import CategoryField from "./form/CategoryField";
import TitleField from "./form/TitleField";
import DescriptionField from "./form/DescriptionField";
import AvailabilityField from "./form/AvailabilityField";
import TimePreferenceField from "./form/TimePreferenceField";

/**
 * Props for the SkillForm component
 * Updated with isMultiProvider flag
 */
interface SkillFormProps {
  mode: 'offer' | 'request';
  isMultiProvider?: boolean; // New prop to indicate if this is a multi-provider request
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * The main SkillForm component that allows users to offer or request skills
 * 
 * This component has been refactored to use smaller, focused components
 * for each part of the form.
 */
const SkillForm = ({ onSuccess, onCancel, mode, isMultiProvider }: SkillFormProps) => {
  // State to store form data
  const [formData, setFormData] = useState<SkillFormData>({
    category: 'technology',
    timePreference: [],
  });
  
  // Custom hooks for toast and skill submission
  const { toast } = useToast();
  const { handleSubmit } = useSkillsExchange({
    onSuccess: () => {
      // Show success toast with notification about matching
      toast({
        title: mode === 'offer' 
          ? "Skill offered successfully" 
          : "Skill requested successfully",
        description: mode === 'offer' 
          ? "Your neighbors with matching skill requests will be notified" 
          : "Your neighbors with matching skill offers will be notified",
      });
      
      // Add a slight delay before closing to make sure everything gets refreshed
      setTimeout(() => {
        onSuccess();
      }, 300);
    }
  });

  // Check for duplicate skills
  const { data: duplicates, isLoading: checkingDuplicates } = useSkillDuplicateCheck(formData, mode);

  // Show warning if duplicates are found
  const duplicateWarning = duplicates && duplicates.length > 0 
    ? `Similar ${mode === 'offer' ? 'offerings' : 'requests'} exist in this category` 
    : null;

  /**
   * Handle form submission
   */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast({
        title: "Category required",
        description: "Please select a skill category",
        variant: "destructive"
      });
      return;
    }

    // If duplicates exist, show a warning toast but still allow submission
    if (duplicates && duplicates.length > 0) {
      toast({
        title: "Similar skills exist",
        description: "You can still submit, but consider checking existing skills first",
        variant: "destructive"
      });
    }

    console.log("[SkillForm] Submitting form:", { formData, mode });
    
    try {
      // Submit the form data
      await handleSubmit(formData, mode);
      console.log("[SkillForm] Form submitted successfully");
    } catch (error) {
      console.error("[SkillForm] Error submitting form:", error);
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
   * Update any form field value
   */
  const updateField = <K extends keyof SkillFormData>(field: K, value: SkillFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Category selection field */}
      <CategoryField 
        value={formData.category as SkillCategory} 
        onChange={(value) => updateField('category', value)} 
      />

      {/* Title input field with duplicate warning */}
      <TitleField 
        mode={mode} 
        value={formData.title} 
        onChange={(value) => updateField('title', value)}
        duplicateWarning={duplicateWarning}
      />

      {/* Description textarea */}
      <DescriptionField 
        mode={mode} 
        value={formData.description} 
        onChange={(value) => updateField('description', value)}
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
