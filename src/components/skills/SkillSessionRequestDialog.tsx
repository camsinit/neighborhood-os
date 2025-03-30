
/**
 * Dialog component for requesting a skill session
 * 
 * This component has been refactored for better maintainability and readability
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import DialogWrapper from "@/components/dialog/DialogWrapper";
import { Form } from "@/components/ui/form";
import { addDays } from "date-fns";
import { TimeSlot } from "./contribution/TimeSlotSelector";
import TimeSlotSelectionSection from "./TimeSlotSelectionSection";
import GeneralAvailabilitySection from "./GeneralAvailabilitySection";
import DescriptionField from "./request-dialog/DescriptionField";
import { 
  useSkillRequestSubmit,
  SkillRequestFormData 
} from "./request-dialog/useSkillRequestSubmit";

/**
 * Props for the dialog component
 */
interface SkillSessionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId: string;
  skillTitle: string;
  providerId: string;
}

/**
 * A dialog component for requesting a skill session
 */
const SkillSessionRequestDialog = ({
  open,
  onOpenChange,
  skillId,
  skillTitle,
  providerId,
}: SkillSessionRequestDialogProps) => {
  // State management
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  
  // Initialize form
  const form = useForm<SkillRequestFormData>({
    defaultValues: {
      description: '',
      availability: 'both',
      timePreference: ['morning', 'afternoon', 'evening'],
    },
  });

  // Custom hook for form submission logic
  const { isSubmitting, submitSkillRequest } = useSkillRequestSubmit(
    skillId, 
    providerId, 
    () => onOpenChange(false)
  );

  // Settings for the date picker
  const disabledDays = {
    before: new Date(),
    after: addDays(new Date(), 90) // Limit date selection to 90 days in the future
  };

  /**
   * Form submission handler
   */
  const onSubmit = async (data: SkillRequestFormData) => {
    await submitSkillRequest(data, selectedTimeSlots);
  };

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={`Request Help with: ${skillTitle}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Description Field */}
          <DescriptionField form={form} />

          {/* Date and Time Selection Section */}
          <TimeSlotSelectionSection
            selectedTimeSlots={selectedTimeSlots}
            setSelectedTimeSlots={setSelectedTimeSlots}
            disabledDays={disabledDays}
          />

          {/* General Availability Section */}
          <GeneralAvailabilitySection form={form} />

          {/* Form Controls */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Form>
    </DialogWrapper>
  );
};

export default SkillSessionRequestDialog;
