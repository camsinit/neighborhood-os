
import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import UniversalDialog from '@/components/ui/universal-dialog';

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
  // State management
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [location, setLocation] = useState<LocationPreference>('contributor_home');
  const [addToProfile, setAddToProfile] = useState(false);
  
  // Custom hook for form submission
  const { isSubmitting, submitContribution } = useContributionSubmit(
    skillRequestId,
    requesterId,
    () => onOpenChange(false)
  );

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

          {/* Date selection calendar */}
          <DateSelectionSection 
            selectedTimeSlots={selectedTimeSlots}
            onDateSelect={(date) => {
              const normalizedDate = new Date(date);
              normalizedDate.setHours(12, 0, 0, 0);
              setSelectedTimeSlots([
                ...selectedTimeSlots, 
                { 
                  date: normalizedDate.toISOString(),
                  preferences: [] 
                }
              ]);
            }}
          />

          {/* Time preferences for selected dates */}
          <div className="space-y-4">
            {selectedTimeSlots.map((slot, index) => (
              <TimeSlotSelector
                key={`${slot.date}-${index}`}
                timeSlot={slot}
                onRemove={() => {
                  setSelectedTimeSlots(slots => 
                    slots.filter((_, i) => i !== index)
                  );
                }}
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
            onSubmit={() => submitContribution(
              selectedTimeSlots,
              location,
              "",
              addToProfile
            )}
          />
        </div>
      </UniversalDialog>
    </TooltipProvider>
  );
};

export default SkillContributionDialog;
