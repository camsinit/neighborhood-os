
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import DialogWrapper from '../dialog/DialogWrapper';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { addDays, format } from 'date-fns';
import { TooltipProvider } from '@/components/ui/tooltip';
import TimeSlotSelector, { TimeSlot } from './contribution/TimeSlotSelector';
import LocationSelector, { LocationPreference } from './contribution/LocationSelector';

interface SkillContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillRequestId: string;
  requestTitle: string;
  requesterId: string;
}

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
  
  // Toast notifications
  const { toast } = useToast();

  // Limit date selection to future dates within 90 days
  const disabledDays = {
    before: new Date(),
    after: addDays(new Date(), 90)
  };

  // Function to handle date selection/deselection on the calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Format the date to compare with existing selections
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Check if the date is already selected
    const existingSlotIndex = selectedTimeSlots.findIndex(
      slot => format(slot.date, 'yyyy-MM-dd') === formattedDate
    );

    // Toggle date selection (remove if already selected, add if not)
    if (existingSlotIndex === -1) {
      // Only allow up to 3 dates
      if (selectedTimeSlots.length < 3) {
        setSelectedTimeSlots([...selectedTimeSlots, { date, preferences: [] }]);
      } else {
        toast({
          title: "Maximum dates selected",
          description: "Please remove a date before adding another one",
          variant: "destructive"
        });
      }
    } else {
      // Remove the date if already selected
      setSelectedTimeSlots(selectedTimeSlots.filter((_, index) => index !== existingSlotIndex));
    }
  };

  // Handler for form submission
  const handleSubmit = async () => {
    // Validation: require at least 3 dates
    if (selectedTimeSlots.length < 3) {
      toast({
        title: "More dates needed",
        description: "Please select at least 3 different dates",
        variant: "destructive"
      });
      return;
    }

    // Validation: require time preferences for each date
    if (selectedTimeSlots.some(slot => slot.preferences.length === 0)) {
      toast({
        title: "Time preferences required",
        description: "Please select at least one time preference for each date",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create the skill session record
      const { data: session, error: sessionError } = await supabase
        .from('skill_sessions')
        .insert({
          skill_id: skillRequestId,
          provider_id: (await supabase.auth.getUser()).data.user?.id,
          requester_id: requesterId,
          location_preference: location,
          location_details: location === 'other' ? locationDetails : null,
          status: 'pending_provider_times',
          requester_availability: {},
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create time slot entries for each selected date and time preference
      const timeSlotPromises = selectedTimeSlots.flatMap(slot =>
        slot.preferences.map(preference => ({
          session_id: session.id,
          proposed_time: new Date(slot.date.setHours(
            preference === 'morning' ? 9 :
            preference === 'afternoon' ? 13 :
            18
          )).toISOString(),
        }))
      );

      const { error: timeSlotError } = await supabase
        .from('skill_session_time_slots')
        .insert(timeSlotPromises);

      if (timeSlotError) throw timeSlotError;

      // Show success message
      toast({
        title: "Skill contribution offered",
        description: "The requester will be notified to schedule a time",
      });
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating skill session:', error);
      toast({
        title: "Error",
        description: "Failed to submit skill contribution. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get array of selected dates for calendar highlighting
  const selectedDates = selectedTimeSlots.map(slot => slot.date);

  return (
    <TooltipProvider>
      <DialogWrapper
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
          <div className="space-y-2">
            <Label>Select 3 dates that work for you</Label>
            <div className="border rounded-lg p-4">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(value) => {
                  // When in multiple mode, value is an array of dates
                  // We need to find which date was clicked by comparing with previous selections
                  if (Array.isArray(value) && value.length !== selectedDates.length) {
                    // Find the date that was added or removed
                    if (value.length > selectedDates.length) {
                      // A date was added - find which one
                      const newDate = value.find(date => 
                        !selectedDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                      );
                      if (newDate) handleDateSelect(newDate);
                    } else {
                      // A date was removed - find which one
                      const removedDate = selectedDates.find(date => 
                        !value.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                      );
                      if (removedDate) handleDateSelect(removedDate);
                    }
                  }
                }}
                disabled={disabledDays}
                className="mx-auto pointer-events-auto"
              />
            </div>
          </div>

          {/* Time preference selectors for each selected date */}
          <div className="space-y-4">
            {selectedTimeSlots.map((slot, index) => (
              <TimeSlotSelector
                key={format(slot.date, 'yyyy-MM-dd')}
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

          {/* Option to add skill to profile */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="add-to-profile"
              checked={addToProfile}
              onCheckedChange={(checked) => setAddToProfile(checked as boolean)}
            />
            <Label htmlFor="add-to-profile">
              Add this skill to my profile for future requests
            </Label>
          </div>

          {/* Submit button */}
          <DialogFooter>
            <Button onClick={handleSubmit}>
              Offer to Contribute
            </Button>
          </DialogFooter>
        </div>
      </DialogWrapper>
    </TooltipProvider>
  );
};

export default SkillContributionDialog;
