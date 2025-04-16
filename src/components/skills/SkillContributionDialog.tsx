
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import UniversalDialog from '@/components/ui/universal-dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { format } from 'date-fns';

// Import refactored components
import TimeSlotSelector, { TimeSlot } from './contribution/TimeSlotSelector';
import LocationSelector, { LocationPreference } from './contribution/LocationSelector';
import DateSelectionSection from './contribution/DateSelectionSection';
import ContributionFormFooter from './contribution/ContributionFormFooter';
import { useContributionSubmit } from './contribution/useContributionSubmit';

/**
 * Props for the SkillContributionDialog component
 */
interface SkillContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillRequestId: string;
  requestTitle: string;
  requesterId: string;
}

/**
 * Dialog component for contributing to a skill request
 * This allows a user to offer their skill by selecting available dates/times
 */
const SkillContributionDialog = ({
  open,
  onOpenChange,
  skillRequestId,
  requestTitle,
  requesterId
}: SkillContributionDialogProps) => {
  // State for selected time slots with dates and preferences
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  
  // State for location preferences
  const [location, setLocation] = useState<LocationPreference>('contributor_home');
  const [locationDetails, setLocationDetails] = useState('');
  
  // Optional setting to add skill to user profile
  const [addToProfile, setAddToProfile] = useState(false);
  
  // Custom hook for form submission
  const { isSubmitting, submitContribution } = useContributionSubmit(
    skillRequestId,
    requesterId,
    () => onOpenChange(false)
  );

  /**
   * Handle date selection from the calendar
   */
  const handleDateSelect = (date: Date) => {
    // Format the date to compare with existing selections
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Check if the date is already selected by comparing formatted date strings
    const existingSlotIndex = selectedTimeSlots.findIndex(
      slot => format(new Date(slot.date), 'yyyy-MM-dd') === formattedDate
    );

    // Toggle date selection (remove if already selected, add if not)
    if (existingSlotIndex === -1) {
      // Convert Date to ISO string to match the TimeSlot interface
      setSelectedTimeSlots([...selectedTimeSlots, { 
        date: date.toISOString(), 
        preferences: [] 
      }]);
    } else {
      // Remove the date if already selected
      setSelectedTimeSlots(selectedTimeSlots.filter((_, index) => index !== existingSlotIndex));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    submitContribution(
      selectedTimeSlots,
      location,
      locationDetails,
      addToProfile
    );
  };

  return (
    <TooltipProvider>
      <UniversalDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Contribute Your Skill"
      >
        <div className="space-y-6 py-4">
          {/* Request title display */}
          <div className="text-center mb-6">
            <h4 className="text-sm font-medium text-gray-500">Contributing to request</h4>
            <p className="text-lg font-semibold text-gray-900">{requestTitle}</p>
          </div>

          {/* Calendar for date selection */}
          <DateSelectionSection 
            selectedTimeSlots={selectedTimeSlots}
            onDateSelect={handleDateSelect}
          />

          {/* Time preference selectors for each selected date */}
          <div className="space-y-4">
            {selectedTimeSlots.map((slot, index) => (
              <TimeSlotSelector
                key={`slot-${index}-${slot.date}`}
                timeSlot={slot}
                onRemove={() => setSelectedTimeSlots(slots => 
                  slots.filter((_, i) => i !== index)
                )}
                onPreferenceChange={(timeId) => {
                  setSelectedTimeSlots(slots =>
                    slots.map((s, i) => {
                      if (i === index) {
                        const preferences = s.preferences.includes(timeId)
                          ? s.preferences.filter(p => p !== timeId)
                          : [...s.preferences, timeId];
                        return { ...s, preferences };
                      }
                      return s;
                    })
                  );
                }}
              />
            ))}
          </div>

          {/* Location preference selection */}
          <LocationSelector 
            value={location} 
            onChange={(value) => setLocation(value)} 
          />

          {/* Form footer with Add to Profile option and Submit button */}
          <ContributionFormFooter
            isSubmitting={isSubmitting}
            addToProfile={addToProfile}
            onAddToProfileChange={(checked) => setAddToProfile(checked)}
            onSubmit={handleSubmit}
          />
        </div>
      </UniversalDialog>
    </TooltipProvider>
  );
};

export default SkillContributionDialog;
