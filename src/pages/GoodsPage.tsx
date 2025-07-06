
import React, { useEffect } from 'react';
import GoodsPageContainer from '@/components/goods/GoodsPageContainer';
import { useSearchParams } from 'react-router-dom';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { useState } from 'react';
import AddItemDialog from '@/components/goods/GoodsDialogs';
import { createLogger } from '@/utils/logger';

const logger = createLogger('GoodsPage');

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
  
  // Enhanced contextual navigation handling
  useEffect(() => {
    const goodsId = searchParams.get('goodsId');
    const urlTab = searchParams.get('tab');
    const sectionParam = searchParams.get('section');
    const highlightId = searchParams.get('highlight');
    const dialogParam = searchParams.get('dialog');
    
    // Handle legacy goodsId parameter
    if (goodsId) {
      highlightItem('goods', goodsId);
    }
    
    // Handle new highlight parameter
    if (highlightId) {
      highlightItem('goods', highlightId);
    }
    
    // Auto-open goods dialog if requested
    if (highlightId && dialogParam === 'true') {
      // Delay to ensure goods item is highlighted first
      setTimeout(() => {
        const goodsElement = document.querySelector(`[data-goods-id="${highlightId}"]`) as HTMLElement;
        if (goodsElement) {
          goodsElement.click(); // Trigger goods detail opening
          logger.info(`Auto-opened goods dialog for: ${highlightId}`);
        }
      }, 1000);
    }
    
    // Scroll to urgent section if specified
    if (sectionParam === 'urgent') {
      setTimeout(() => {
        const urgentSection = document.querySelector('[data-section="urgent"]');
        if (urgentSection) {
          urgentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          logger.info('Scrolled to urgent goods section');
        }
      }, 800);
    }
    
    logger.info('Goods page contextual navigation:', {
      tab: urlTab,
      section: sectionParam,
      highlight: highlightId,
      dialog: dialogParam
    });
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
