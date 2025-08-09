
import UniversalDialog from "./ui/universal-dialog";
import EventForm from "./events/EventForm";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNeighborhood } from "@/contexts/neighborhood";
import { createLogger } from "@/utils/logger";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent: (event: any) => void;
  initialDate?: Date | null;
}

/**
 * AddEventDialog component - Modal for creating new events
 * 
 * This dialog loads the current neighborhood's timezone and
 * displays the EventForm for creating new events.
 */
// Create a module-scoped logger instance for controlled logging
const logger = createLogger('AddEventDialog');

const AddEventDialog = ({ open, onOpenChange, onAddEvent, initialDate }: AddEventDialogProps) => {
  // Get the current neighborhood
  const { currentNeighborhood } = useNeighborhood();
  
  // State for neighborhood timezone
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>('America/Los_Angeles');
  
  // Fetch the neighborhood timezone when the dialog opens
  useEffect(() => {
    const fetchNeighborhoodTimezone = async () => {
      if (currentNeighborhood?.id) {
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('timezone')
          .eq('id', currentNeighborhood.id)
          .single();
          
        if (data && !error) {
          setNeighborhoodTimezone(data.timezone || 'America/Los_Angeles');
          // Use our logger for debug-friendly, environment-aware logging
          logger.info('Using timezone', { timezone: data.timezone || 'America/Los_Angeles' });
        }
      }
    };
    
    if (open && currentNeighborhood) {
      fetchNeighborhoodTimezone();
    }
  }, [open, currentNeighborhood]);
  
  // Format the initial date for the form if provided
  const formattedDate = initialDate ? format(initialDate, 'yyyy-MM-dd') : '';
  const formattedTime = initialDate ? format(initialDate, 'HH:mm') : '';

  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Event"
    >
      <div className="mb-4 text-sm text-gray-500">
        All times are in {neighborhoodTimezone.replace('_', ' ')} timezone
      </div>
      <EventForm 
        onClose={() => onOpenChange(false)} 
        onAddEvent={onAddEvent}
        initialValues={{
          date: formattedDate,
          time: formattedTime
        }}
        neighborhoodTimezone={neighborhoodTimezone}
      />
    </UniversalDialog>
  );
};

export default AddEventDialog;
