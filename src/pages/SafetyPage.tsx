
import React, { useEffect } from 'react';
import { ModuleLayout } from '@/components/layout';
import SafetyUpdates from '@/components/SafetyUpdates';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AddSafetyUpdateDialogNew from '@/components/safety/AddSafetyUpdateDialogNew';
import { useSearchParams } from 'react-router-dom'; 
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';

function SafetyPage() {
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
    <ModuleLayout
      title="Community Updates" 
      description="Stay informed about important updates in your community"
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
    >
      <SafetyUpdates />

      {/* Render the AddSafetyUpdateDialogNew component */}
      <AddSafetyUpdateDialogNew 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </ModuleLayout>
  );
}

export default SafetyPage;
