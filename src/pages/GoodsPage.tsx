
import React, { useEffect } from 'react';
import { ModuleLayout } from '@/components/layout';
import GoodsPageContainer from '@/components/goods/GoodsPageContainer';
import { useSearchParams } from 'react-router-dom';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';

function GoodsPage() {
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
