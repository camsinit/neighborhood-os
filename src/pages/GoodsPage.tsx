
import React, { useState } from 'react';
import GoodsPageContainer from '@/components/goods/GoodsPageContainer';
import { usePageSheetController } from '@/hooks/usePageSheetController';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
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
    <ModuleContainer themeColor="goods">
      {/* Header with just the title */}
      <ModuleHeader 
        title="Freebies & Exchanges"
        themeColor="goods"
      />
      
      {/* Full-width description box with consistent padding */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-6 sm:px-[25px]">
        <div className="module-description bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm mx-0 px-[16px]">
          <p className="text-gray-700 text-sm">Share items with your neighbors or find what you need</p>
        </div>
      </div>
      
      <ModuleContent>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <GoodsPageContainer />
        </div>
      </ModuleContent>
      
      {/* Universal sheet management */}
      {isSheetOpen && sheetItem && (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
          <GoodsSheetContent item={sheetItem} onOpenChange={closeSheet} />
        </Sheet>
      )}
    </ModuleContainer>
  );
}

export default GoodsPage;
