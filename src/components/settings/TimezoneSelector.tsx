
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { getCommonTimezones } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNeighborhood } from '@/contexts/neighborhood';

/**
 * Timezone selector component for neighborhood settings
 * 
 * This component allows users to select a timezone for their neighborhood
 * from a list of common timezones.
 */
const TimezoneSelector = () => {
  // Get the current neighborhood from context
  const { currentNeighborhood, refreshNeighborhoodData } = useNeighborhood();
  
  // State for the selected timezone
  const [timezone, setTimezone] = useState<string>('America/Los_Angeles');
  const [isLoading, setIsLoading] = useState(false);
  
  // List of common timezones
  const timezones = getCommonTimezones();
  
  // Set the initial timezone when the neighborhood loads
  useEffect(() => {
    // Check if neighborhood has a timezone field
    if (currentNeighborhood) {
      // Fetch the timezone directly from the database to ensure we have the latest value
      const fetchNeighborhoodTimezone = async () => {
        if (currentNeighborhood.id) {
          const { data, error } = await supabase
            .from('neighborhoods')
            .select('timezone')
            .eq('id', currentNeighborhood.id)
            .single();
            
          if (data && !error) {
            setTimezone(data.timezone || 'America/Los_Angeles');
            console.log(`[TimezoneSelector] Using timezone: ${data.timezone}`);
          }
        }
      };
      
      fetchNeighborhoodTimezone();
    }
  }, [currentNeighborhood]);
  
  // Handle timezone selection
  const handleTimezoneChange = async (value: string) => {
    setTimezone(value);
    
    // Early return if no neighborhood selected
    if (!currentNeighborhood?.id) {
      toast.error("No neighborhood selected");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update the neighborhood timezone in the database
      const { error } = await supabase
        .from('neighborhoods')
        .update({ timezone: value })
        .eq('id', currentNeighborhood.id);
        
      if (error) {
        throw error;
      }
      
      toast.success("Timezone updated successfully");
      
      // Refresh neighborhood data to get the updated timezone
      refreshNeighborhoodData();
    } catch (error: any) {
      console.error('Error updating neighborhood timezone:', error);
      toast.error(`Failed to update timezone: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="timezone">Neighborhood Timezone</Label>
        <Select value={timezone} onValueChange={handleTimezoneChange} disabled={isLoading}>
          <SelectTrigger id="timezone" className="w-full">
            <SelectValue placeholder="Select a timezone" />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          This timezone will be used for all events and activities in your neighborhood.
        </p>
      </div>
    </div>
  );
};

export default TimezoneSelector;
