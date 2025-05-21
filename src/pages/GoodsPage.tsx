
import React, { useEffect } from 'react';
import GoodsPageContainer from '@/components/goods/GoodsPageContainer';
import { useSearchParams } from 'react-router-dom';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import AddItemDialog from '@/components/goods/GoodsDialogs';

/**
 * GoodsPage Component
 * 
 * Displays the goods exchange functionality with proper module styling
 * and supports highlighting goods items from deep links.
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
      <ModuleHeader 
        title="Freebies & Exchanges"
        description="Share items with your neighbors or find what you need"
        themeColor="goods"
        actions={
          <Button 
            className="whitespace-nowrap flex items-center gap-1.5"
            onClick={() => setIsAddItemOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Item</span>
          </Button>
        }
      />
      <ModuleContent>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <GoodsPageContainer />
        </div>
      </ModuleContent>
    </ModuleContainer>
  );
}

export default GoodsPage;
