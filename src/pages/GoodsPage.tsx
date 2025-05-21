
import React, { useEffect } from 'react';
import GoodsPageContainer from '@/components/goods/GoodsPageContainer';
import { useSearchParams } from 'react-router-dom';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { useState } from 'react';
import AddItemDialog from '@/components/goods/GoodsDialogs';

/**
 * GoodsPage Component
 * 
 * Displays the goods exchange functionality with proper module styling
 * and supports highlighting goods items from deep links.
 * Now uses the standardized module layout with full-width description.
 */
function GoodsPage() {
  // State for route parameters and highlighting
  const [searchParams] = useSearchParams();
  const highlightedItem = useHighlightedItem('goods');
  
  // State for dialog controls
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  
  // Effect to handle deep linking to specific goods items
  useEffect(() => {
    const goodsId = searchParams.get('goodsId');
    if (goodsId) {
      highlightItem('goods', goodsId);
    }
  }, [searchParams]);
  
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
    </ModuleContainer>
  );
}

export default GoodsPage;
