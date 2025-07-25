
import React, { useState, useEffect } from 'react';
import GoodsPageContainer from '@/components/goods/GoodsPageContainer';
import { usePageSheetController } from '@/hooks/usePageSheetController';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import GoodsSheetContent from '@/components/goods/GoodsSheetContent';
import GoodsForm from '@/components/goods/GoodsForm';
import { useGoodsExchange } from '@/utils/queries/useGoodsExchange';
import { moduleThemeColors } from '@/theme/moduleTheme';
import { useSearchParams } from 'react-router-dom';

/**
 * GoodsPage Component
 * 
 * Displays the goods exchange functionality with universal sheet management
 * and supports highlighting goods items from deep links.
 */
function GoodsPage() {
  const { data: goodsData } = useGoodsExchange();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Universal page controller for sheet management (viewing existing items)
  const {
    isSheetOpen,
    sheetItem,
    openSheet,
    closeSheet
  } = usePageSheetController({
    contentType: 'goods',
    fetchItem: async (id: string) => {
      return goodsData?.find(item => item.id === id) || null;
    },
    pageName: 'GoodsPage'
  });
  
  // State management for add/offer sheet
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  
  // Handle URL parameters to auto-open sheet
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'offer') {
      setInitialRequestType('offer');
      setIsAddSheetOpen(true);
      setSearchParams({}); // Clear URL params
    } else if (action === 'request') {
      setInitialRequestType('need');
      setIsAddSheetOpen(true);
      setSearchParams({}); // Clear URL params
    }
  }, [searchParams, setSearchParams]);
  
  // Handlers for opening add sheets
  const handleAddItem = () => {
    setInitialRequestType('offer');
    setIsAddSheetOpen(true);
  };

  const handleAddRequest = () => {
    setInitialRequestType('need');
    setIsAddSheetOpen(true);
  };
  
  const closeAddSheet = () => {
    setIsAddSheetOpen(false);
    setInitialRequestType(null);
  };
  
  // Determine the sheet title based on the request type
  const getSheetTitle = () => {
    if (!initialRequestType) return "Add Item";
    return initialRequestType === "offer" ? "Offer an Item" : "Request an Item";
  };
  
  return (
    <>
      <ModuleLayout
        title="Freebies"
        description="Share items with your neighbors or find what you need"
        themeColor="goods"
      >
        <div 
          className="backdrop-blur-sm rounded-lg p-6 shadow-lg border"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: moduleThemeColors.goods.primary + '40',
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px ${moduleThemeColors.goods.primary}10`
          }}
        >
          <GoodsPageContainer 
            onOfferItem={handleAddItem}
            onRequestItem={handleAddRequest}
          />
        </div>
      </ModuleLayout>
      
      {/* Sheet for viewing existing items */}
      {isSheetOpen && sheetItem && (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
          <GoodsSheetContent item={sheetItem} onOpenChange={closeSheet} />
        </Sheet>
      )}
      
      {/* Sheet for adding new items */}
      {isAddSheetOpen && (
        <Sheet open={isAddSheetOpen} onOpenChange={(open) => !open && closeAddSheet()}>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-xl font-bold">
                {getSheetTitle()}
              </SheetTitle>
            </SheetHeader>
            <GoodsForm 
              onClose={closeAddSheet}
              initialRequestType={initialRequestType}
              mode="create"
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

export default GoodsPage;
