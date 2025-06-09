
// Base card component for goods items with shared styling and structure
import React from 'react';
import { cn } from "@/lib/utils";

interface BaseGoodsCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
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
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
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
