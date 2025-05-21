
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import GoodsPageContainer from '@/components/goods/GoodsPageContainer';

/**
 * GoodsPage Component
 * 
 * This page displays the goods exchange functionality, allowing users
 * to share and request items within their neighborhood.
 * Properly structured using the module system for consistent layout and theming.
 */
function GoodsPage() {
  // Hooks for handling URL params and highlighted items
  const [searchParams] = useSearchParams();
  const highlightedItem = useHighlightedItem('goods');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  
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
        title="Freebies" 
        description="Share items with your neighbors or find things you need"
        themeColor="goods"
        actions={
          <Button
            className="whitespace-nowrap flex items-center gap-1.5"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Offer Item</span>
          </Button>
        }
      />
      <ModuleContent>
        {/* Render the existing GoodsPageContainer */}
        <GoodsPageContainer
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
        />
      </ModuleContent>
    </ModuleContainer>
  );
}

export default GoodsPage;
