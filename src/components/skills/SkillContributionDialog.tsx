
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import DialogWrapper from '../dialog/DialogWrapper';
import { useToast } from '@/components/ui/use-toast';
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
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [location, setLocation] = useState<LocationPreference>('contributor_home');
  const [locationDetails, setLocationDetails] = useState('');
  const [addToProfile, setAddToProfile] = useState(false);
  const { toast } = useToast();

  const disabledDays = {
    before: new Date(),
    after: addDays(new Date(), 90)
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const formattedDate = format(date, 'yyyy-MM-dd');
    const existingSlotIndex = selectedTimeSlots.findIndex(
      slot => format(slot.date, 'yyyy-MM-dd') === formattedDate
    );

    if (existingSlotIndex === -1) {
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
      setSelectedTimeSlots(selectedTimeSlots.filter((_, index) => index !== existingSlotIndex));
    }
  };

  const handleSubmit = async () => {
    if (selectedTimeSlots.length < 3) {
      toast({
        title: "More dates needed",
        description: "Please select at least 3 different dates",
        variant: "destructive"
      });
      return;
    }

    if (selectedTimeSlots.some(slot => slot.preferences.length === 0)) {
      toast({
        title: "Time preferences required",
        description: "Please select at least one time preference for each date",
        variant: "destructive"
      });
      return;
    }

    try {
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

      toast({
        title: "Skill contribution offered",
        description: "The requester will be notified to schedule a time",
      });
      
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

  return (
    <TooltipProvider>
      <DialogWrapper
        open={open}
        onOpenChange={onOpenChange}
        title="Contribute Your Skill"
      >
        <div className="space-y-6 py-4">
          <div className="text-center mb-6">
            <h4 className="text-sm font-medium text-gray-500">Contributing to request</h4>
            <p className="text-lg font-semibold text-gray-900">{requestTitle}</p>
          </div>

          <div className="space-y-2">
            <Label>Select 3 dates that work for you</Label>
            <div className="border rounded-lg p-4">
              <Calendar
                mode="single"
                selected={undefined}
                onSelect={handleDateSelect}
                disabled={disabledDays}
                className="mx-auto"
              />
            </div>
          </div>

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

          <LocationSelector 
            value={location} 
            onChange={(value) => setLocation(value)} 
          />

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
