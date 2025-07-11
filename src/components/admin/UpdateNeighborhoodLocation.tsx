import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Component for updating neighborhood location information
 * Only accessible to neighborhood creators
 */
interface UpdateNeighborhoodLocationProps {
  neighborhoodId: string;
  currentCity?: string;
  currentState?: string;
  onLocationUpdated?: () => void;
}

export const UpdateNeighborhoodLocation: React.FC<UpdateNeighborhoodLocationProps> = ({
  neighborhoodId,
  currentCity = '',
  currentState = '',
  onLocationUpdated
}) => {
  // Form state for city and state inputs
  const [city, setCity] = useState(currentCity);
  const [state, setState] = useState(currentState);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Handle updating the neighborhood location in the database
   */
  const handleUpdateLocation = async () => {
    if (!city.trim() || !state.trim()) {
      toast.error('Please enter both city and state');
      return;
    }

    setIsUpdating(true);

    try {
      // Update the neighborhood location in the database
      const { error } = await supabase
        .from('neighborhoods')
        .update({
          city: city.trim(),
          state: state.trim()
        })
        .eq('id', neighborhoodId);

      if (error) {
        throw error;
      }

      toast.success('Neighborhood location updated successfully!');
      
      // Call the callback to refresh parent component if provided
      if (onLocationUpdated) {
        onLocationUpdated();
      }

    } catch (error: any) {
      console.error('Error updating neighborhood location:', error);
      toast.error(error.message || 'Failed to update neighborhood location');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Update Neighborhood Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* City Input */}
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={isUpdating}
          />
        </div>

        {/* State Input */}
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            type="text"
            placeholder="Enter state (e.g., CA, NY, TX)"
            value={state}
            onChange={(e) => setState(e.target.value)}
            disabled={isUpdating}
          />
        </div>

        {/* Current Location Display */}
        <div className="text-sm text-muted-foreground">
          <strong>Current:</strong> {currentCity && currentState 
            ? `${currentCity}, ${currentState}` 
            : 'Location not specified'
          }
        </div>

        {/* Update Button */}
        <Button 
          onClick={handleUpdateLocation}
          disabled={isUpdating || (!city.trim() || !state.trim())}
          className="w-full"
        >
          {isUpdating ? 'Updating...' : 'Update Location'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpdateNeighborhoodLocation;