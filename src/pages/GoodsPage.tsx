
import React, { useEffect } from 'react';
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
  
  return <GoodsPageContainer />;
}

export default GoodsPage;
