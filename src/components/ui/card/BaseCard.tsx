
/**
 * BaseCard.tsx
 * 
 * A foundational card component that all other card variants will extend from.
 * This provides consistent styling, hover states, and data attribute handling.
 */
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Props that all cards should have
export interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Standard props
  children: React.ReactNode;
  className?: string;
  
  // Highlighting capabilities
  highlightable?: boolean;
  isHighlighted?: boolean;
  
  // Data attributes for item identification
  itemId?: string;
  itemType?: string;
  dataAttribute?: string;
}

/**
 * BaseCard component that provides consistent card styling and behavior
 * 
 * This component handles:
 * - Consistent styling across all cards
 * - Support for highlighting (active state)
 * - Data attributes for identification
 * - Proper hover states
 */
const BaseCard = forwardRef<HTMLDivElement, BaseCardProps>(
  ({ 
    children, 
    className, 
    highlightable = false,
    isHighlighted = false,
    itemId,
    itemType,
    dataAttribute,
    ...props 
  }, ref) => {
    // Create data attributes object for the card
    const dataAttributes: {[key: string]: string} = {};
    if (itemId && dataAttribute) {
      dataAttributes[`data-${dataAttribute}`] = itemId;
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Base styling for all cards
          "bg-white rounded-lg border border-gray-200 shadow-sm",
          // Hover state
          "transition-all duration-200 hover:shadow-md hover:border-gray-300",
          // Highlight state
          highlightable && "highlight-item",
          isHighlighted && "active",
          className
        )}
        // Apply data attributes for item identification
        {...dataAttributes}
        // Pass through remaining props
        {...props}
      >
        {children}
      </div>
    );
  }
);

BaseCard.displayName = "BaseCard";

export default BaseCard;
