
import React, { useState } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
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
    <>
      <ModuleLayout
        title="Updates"
        description="Stay informed about safety in your community"
        themeColor="safety"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <SafetyUpdates />
        </div>
      </ModuleLayout>

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
    </>
  );
}

export default SafetyPage;
