
import React, { useState } from 'react';
import GoodsPageContainer from '@/components/goods/GoodsPageContainer';
import { usePageSheetController } from '@/hooks/usePageSheetController';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { Sheet } from '@/components/ui/sheet';
import GoodsSheetContent from '@/components/goods/GoodsSheetContent';
import { useGoodsExchange } from '@/utils/queries/useGoodsExchange';

/**
 * GoodsPage Component
 * 
 * Displays the goods exchange functionality with universal sheet management
 * and supports highlighting goods items from deep links.
 */
function GoodsPage() {
  const { data: goodsData } = useGoodsExchange();
  
  // Universal page controller for sheet management
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
  
  return (
    <>
      <ModuleLayout
        title="Freebies & Exchanges"
        description="Share items with your neighbors or find what you need"
        themeColor="goods"
      >
        <GoodsPageContainer />
      </ModuleLayout>
      
      {/* Universal sheet management */}
      {isSheetOpen && sheetItem && (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
          <GoodsSheetContent item={sheetItem} onOpenChange={closeSheet} />
        </Sheet>
      )}
    </>
  );
}

export default GoodsPage;
