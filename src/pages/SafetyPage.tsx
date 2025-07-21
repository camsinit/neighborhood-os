
import React, { useState } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import SafetyUpdates from '@/components/SafetyUpdates';
import { usePageSheetController } from '@/hooks/usePageSheetController';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AppSheetContent } from '@/components/ui/app-sheet-content';
import SafetySheetContent from '@/components/safety/SafetySheetContent';
import SafetyUpdateForm from '@/components/safety/SafetyUpdateForm';
import { useSafetyUpdates } from '@/utils/queries/useSafetyUpdates';
import { moduleThemeColors } from '@/theme/moduleTheme';

/**
 * SafetyPage Component
 * 
 * Displays the safety updates with universal sheet management
 * and supports highlighting specific updates from deep links.
 * Now uses Sheet for adding new safety updates (consistent with other pages).
 */
function SafetyPage() {
  const { data: safetyUpdates } = useSafetyUpdates();
  
  // Universal page controller for sheet management (viewing existing updates)
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
  
  // State for add update sheet
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  
  return (
    <>
      <ModuleLayout
        title="Updates"
        description="Stay informed about safety in your community"
        themeColor="safety"
      >
        <div 
          className="backdrop-blur-sm rounded-lg p-6 shadow-lg border"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: moduleThemeColors.safety.primary + '40',
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px ${moduleThemeColors.safety.primary}10`
          }}
        >
          <SafetyUpdates onAddUpdate={() => setIsAddSheetOpen(true)} />
        </div>
      </ModuleLayout>

      {/* Sheet for viewing existing updates */}
      {isSheetOpen && sheetItem && (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
          <SafetySheetContent update={sheetItem} onOpenChange={closeSheet} />
        </Sheet>
      )}

      {/* Sheet for adding new safety updates - consistent with other pages */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <AppSheetContent 
          side="right" 
          moduleTheme="safety"
        >
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold">
              Share Safety Update
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <SafetyUpdateForm onSuccess={() => setIsAddSheetOpen(false)} />
          </div>
        </AppSheetContent>
      </Sheet>
    </>
  );
}

export default SafetyPage;
