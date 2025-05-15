
/**
 * ModuleItemCard.tsx
 * 
 * A specialized card component for module items like skills, events, etc.
 * This provides consistent styling and behavior for items in module lists.
 */
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import BaseCard, { BaseCardProps } from "./BaseCard";
import { dataAttributeMap } from "@/utils/highlight/constants";
import { type HighlightableItemType } from "@/utils/highlight/types";

// Props specific to module items
export interface ModuleItemCardProps extends Omit<BaseCardProps, 'dataAttribute' | 'itemType'> {
  // Module-specific props
  itemType: HighlightableItemType;
  accentColor?: string;
  compact?: boolean;
  interactive?: boolean;
}

/**
 * ModuleItemCard component for displaying items in module lists
 * 
 * This component:
 * - Uses the correct data attribute for the item type
 * - Applies consistent sizing based on compact mode
 * - Handles interactive behaviors consistently
 */
const ModuleItemCard = forwardRef<HTMLDivElement, ModuleItemCardProps>(
  ({ 
    children, 
    className, 
    itemId,
    itemType,
    accentColor,
    compact = false,
    interactive = true,
    highlightable = true,
    isHighlighted = false,
    ...props 
  }, ref) => {
    // Look up the correct data attribute for this item type
    const dataAttribute = dataAttributeMap[itemType];
    
    return (
      <BaseCard
        ref={ref}
        className={cn(
          // Apply different padding based on compact mode
          compact ? "p-3" : "p-4",
          // Make the card interactive if specified
          interactive && "cursor-pointer",
          // Apply accent color if provided
          accentColor && `border-l-4 border-l-[${accentColor}]`,
          className
        )}
        // Pass through highlight-related props
        highlightable={highlightable}
        isHighlighted={isHighlighted}
        // Pass through item identification
        itemId={itemId}
        dataAttribute={dataAttribute}
        // Pass through remaining props
        {...props}
      >
        {children}
      </BaseCard>
    );
  }
);

ModuleItemCard.displayName = "ModuleItemCard";

export default ModuleItemCard;
