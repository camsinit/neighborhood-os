
import React, { useState } from 'react';
import { useGoodsExchange } from '@/utils/queries/useGoodsExchange';
import { GoodsSections } from './GoodsSections';
import GoodsPageHeader from './GoodsPageHeader';
import GoodsSearchBar from './GoodsSearchBar';
import { GoodsDialogs } from './GoodsDialogs';
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";

const GoodsPageContainer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUrgent, setShowUrgent] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [showAvailable, setShowAvailable] = useState(true);
  
  // Add some new states for dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'offer' | 'request'>('offer');
  
  // Fetch goods data
  const { data: goodsData, isLoading } = useGoodsExchange();

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#FFEFD5] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <GoodsPageHeader 
            onAddItem={() => {
              setViewMode('offer');
              setAddDialogOpen(true);
            }} 
            onAddRequest={() => {
              setViewMode('request');
              setAddDialogOpen(true);
            }}
          />
          
          <GlowingDescriptionBox colorClass="goods-color">
            <p className="text-gray-700 text-sm">
              Share resources with your neighbors through our community exchange. 
              Offer items you no longer need, or find things you're looking for.
            </p>
          </GlowingDescriptionBox>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <GoodsSearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              showUrgent={showUrgent}
              onToggleUrgent={() => setShowUrgent(!showUrgent)}
              showRequests={showRequests}
              onToggleRequests={() => setShowRequests(!showRequests)}
              showAvailable={showAvailable}
              onToggleAvailable={() => setShowAvailable(!showAvailable)}
            />
            
            <GoodsSections 
              goodsData={goodsData}
              isLoading={isLoading}
              searchQuery={searchQuery}
              showUrgent={showUrgent}
              showRequests={showRequests}
              showAvailable={showAvailable}
            />
          </div>
          
          <GoodsDialogs 
            addDialogOpen={addDialogOpen}
            onAddDialogOpenChange={setAddDialogOpen}
            viewMode={viewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default GoodsPageContainer;
