
import React, { useEffect, useState } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import SafetyUpdates from '@/components/SafetyUpdates';
import AddSafetyUpdateDialogNew from '@/components/safety/AddSafetyUpdateDialogNew';
import { useSearchParams } from 'react-router-dom'; 
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';

/**
 * SafetyPage Component
 * 
 * Displays the safety updates with proper module styling
 * and supports highlighting specific updates from deep links.
 */
function SafetyPage() {
  // State for route parameters and highlighting
  const [searchParams] = useSearchParams();
  const highlightedUpdate = useHighlightedItem('safety');
  
  // State for dialog controls
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
      />
      <ModuleContent>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <SafetyUpdates />
        </div>
      </ModuleContent>

      {/* Render the AddSafetyUpdateDialogNew component */}
      <AddSafetyUpdateDialogNew 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </ModuleContainer>
  );
}

export default SafetyPage;
