
// Base card component for goods items with shared styling and structure
import React from 'react';
import { cn } from "@/lib/utils";

interface BaseGoodsCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const BaseGoodsCard: React.FC<BaseGoodsCardProps> = ({
  children,
  className,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "w-full h-32 flex items-stretch rounded-lg border border-gray-200",
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
