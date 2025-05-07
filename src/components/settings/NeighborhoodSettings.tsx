
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TimezoneSelector from './TimezoneSelector';
import { useNeighborhood } from '@/contexts/neighborhood';

/**
 * Neighborhood settings component
 * 
 * This component displays settings for the current neighborhood,
 * such as timezone selection.
 */
const NeighborhoodSettings = () => {
  const { currentNeighborhood } = useNeighborhood();
  
  if (!currentNeighborhood) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Neighborhood Settings</CardTitle>
          <CardDescription>
            Please select a neighborhood to view settings
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Neighborhood Settings</CardTitle>
        <CardDescription>
          Configure settings for {currentNeighborhood.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TimezoneSelector />
        {/* Add more neighborhood settings here in the future */}
      </CardContent>
    </Card>
  );
};

export default NeighborhoodSettings;
