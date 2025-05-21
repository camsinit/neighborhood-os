
import React, { useEffect } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import SafetyUpdates from '@/components/SafetyUpdates';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AddSafetyUpdateDialogNew from '@/components/safety/AddSafetyUpdateDialogNew';
import { useSearchParams } from 'react-router-dom'; 
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';

/**
 * SafetyPage Component
 * 
 * This page displays safety updates and alerts for the neighborhood.
 * Uses the module system for consistent layout and theming.
 */
function SafetyPage() {
  // Hooks for handling URL params and highlighted items
  const [searchParams] = useSearchParams();
  const highlightedUpdate = useHighlightedItem('safety');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  // Effect to handle deep linking to specific safety updates
  useEffect(() => {
    const updateId = searchParams.get('updateId');
    if (updateId) {
      highlightItem('safety', updateId);
    }
  }, [searchParams]);
  
  return (
    <ModuleContainer themeColor="safety">
      <ModuleHeader 
        title="Safety Updates" 
        description="Stay informed about safety in your community"
        themeColor="safety"
        actions={
          <Button 
            className="whitespace-nowrap flex items-center gap-1.5"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post Update</span>
          </Button>
        }
      />
      <ModuleContent>
        <SafetyUpdates />
      </ModuleContent>

      {/* Safety update dialog */}
      <AddSafetyUpdateDialogNew 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </ModuleContainer>
  );
}

export default SafetyPage;
