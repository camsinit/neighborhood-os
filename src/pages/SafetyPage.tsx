import React, { useEffect } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import SafetyUpdates from '@/components/SafetyUpdates';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AddSafetyUpdateDialog from '@/components/safety/AddSafetyUpdateDialogNew';
import { useSearchParams } from 'react-router-dom'; 
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';

function SafetyPage() {
  const [searchParams] = useSearchParams();
  const highlightedUpdate = useHighlightedItem('safety');
  
  // Effect to handle deep linking to specific safety updates
  useEffect(() => {
    const updateId = searchParams.get('updateId');
    if (updateId) {
      // Fixed highlightItem call
      highlightItem('safety', updateId);
    }
  }, [searchParams]);
  
  return (
    <ModuleContainer>
      <ModuleHeader 
        title="Safety Updates" 
        description="Stay informed about safety in your community"
        actions={
          <AddSafetyUpdateDialog>
            <Button className="whitespace-nowrap flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4" />
              <span>Post Update</span>
            </Button>
          </AddSafetyUpdateDialog>
        }
      />
      <ModuleContent>
        <SafetyUpdates />
      </ModuleContent>
    </ModuleContainer>
  );
}

export default SafetyPage;
