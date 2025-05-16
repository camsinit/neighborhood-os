
import React, { useEffect } from 'react';
import { ModuleLayout } from '@/components/layout';
import GoodsPageContainer from '@/components/goods/GoodsPageContainer';
import { useSearchParams } from 'react-router-dom';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';

/**
 * GoodsPage Component
 * 
 * This component is the main page for the Goods Exchange module.
 * It handles deep linking to goods items via URL parameters.
 */
function GoodsPage() {
  // Access URL parameters and highlight system
  const [searchParams] = useSearchParams();
  const highlightedItem = useHighlightedItem('goods');
  
  // Effect to handle deep linking to specific goods items
  useEffect(() => {
    const goodsId = searchParams.get('goodsId');
    if (goodsId) {
      highlightItem('goods', goodsId);
    }
  }, [searchParams]);
  
  return (
    <ModuleLayout
      title="Goods Exchange"
      description="Share and request goods with your neighbors"
      themeColor="goods"
    >
      <GoodsPageContainer />
    </ModuleLayout>
  );
}

export default GoodsPage;
