
import React, { useState } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import SafetyUpdates from '@/components/SafetyUpdates';
import AddSafetyUpdateDialogNew from '@/components/safety/AddSafetyUpdateDialogNew';
import { usePageSheetController } from '@/hooks/usePageSheetController';
import { Sheet } from '@/components/ui/sheet';
import SafetySheetContent from '@/components/safety/SafetySheetContent';
import { useSafetyUpdates } from '@/utils/queries/useSafetyUpdates';

/**
 * SafetyPage Component
 * 
 * Displays the safety updates with universal sheet management
 * and supports highlighting specific updates from deep links.
 */
function SafetyPage() {
  const { data: safetyUpdates } = useSafetyUpdates();
  
  // Universal page controller for sheet management
  const {
    isSheetOpen,
    sheetItem,
    openSheet,
    closeSheet
  } = usePageSheetController({
    contentType: 'safety',
    fetchItem: async (id: string) => {
      return safetyUpdates?.data?.find(update => update.id === id) || null;
    },
    pageName: 'SafetyPage'
  });
  
  // State for dialog controls
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <ModuleContainer themeColor="safety">
      {/* Header with just the title */}
      <ModuleHeader 
        title="Updates" 
        themeColor="safety"
      />
      
      {/* Full-width description box with consistent padding */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-6 sm:px-[25px]">
        <div className="module-description bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm mx-0 px-[16px]">
          <p className="text-gray-700 text-sm">Stay informed about safety in your community</p>
        </div>
      </div>
      
      <ModuleContent>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <SafetyUpdates />
        </div>
      </ModuleContent>

      {/* Universal sheet management */}
      {isSheetOpen && sheetItem && (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
          <SafetySheetContent update={sheetItem} onOpenChange={closeSheet} />
        </Sheet>
      )}

      {/* Render the AddSafetyUpdateDialogNew component */}
      <AddSafetyUpdateDialogNew 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </ModuleContainer>
  );
}

export default SafetyPage;
