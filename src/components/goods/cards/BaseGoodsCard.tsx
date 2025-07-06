
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Sheet } from "@/components/ui/sheet";
import GoodsSheetContent from '../GoodsSheetContent';

interface BaseGoodsCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (item?: any) => void; // Changed to pass item data
  item?: any; // Add item prop for sheet functionality
  showSheet?: boolean; // Control whether to show sheet on click
}

/**
 * BaseGoodsCard - Base component for goods cards
 * 
 * Updated to provide a taller layout that accommodates the new marketplace-style design
 * with prominent titles, description previews, and user profile information
 */
const BaseGoodsCard: React.FC<BaseGoodsCardProps> = ({
  children,
  className,
  onClick,
  item,
  showSheet = true
}) => {
  const handleClick = () => {
    if (onClick && item) {
      onClick(item);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        // Updated height to accommodate the new layout with title, description, and user info
        "w-full h-32 flex rounded-lg border border-gray-200",
        "hover:border-gray-300 bg-white cursor-pointer transition-colors shadow-sm",
        "relative overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
};

export default BaseGoodsCard;
