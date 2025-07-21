import * as React from "react";
import { SheetContent } from "@/components/ui/sheet";
import { moduleThemeColors } from "@/theme/moduleTheme";
import { cn } from "@/lib/utils";

/**
 * AppSheetContent - Unified side panel component
 * 
 * This component provides a consistent foundation for all side panels across the app.
 * It ensures uniform styling, theming, and behavior while allowing module-specific customization.
 * 
 * Features:
 * - Clean white background for all panels
 * - Consistent width and spacing
 * - Optional module theming with left border accent
 * - Standardized shadow and styling
 * - Proper overflow handling for long content
 */

// Define the module theme types
export type ModuleTheme = keyof typeof moduleThemeColors;

// Extended props interface that includes module theming
interface AppSheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetContent> {
  /**
   * Optional module theme for accent coloring
   * Applies the module's primary color as a left border accent
   */
  moduleTheme?: ModuleTheme;
  /**
   * Custom width override (defaults to responsive w-[400px] sm:w-[540px])
   */
  width?: string;
}

/**
 * AppSheetContent Component
 * 
 * A enhanced version of SheetContent that provides:
 * - Consistent white background across all side panels
 * - Optional module-themed left border for visual association
 * - Standardized responsive width (400px mobile, 540px desktop)
 * - Clean shadow and border styling
 * - Automatic overflow handling for scrollable content
 */
const AppSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetContent>,
  AppSheetContentProps
>(({ 
  className, 
  children, 
  moduleTheme, 
  width = "w-[400px] sm:w-[540px]",
  ...props 
}, ref) => {
  
  // Build the styling based on module theme
  const themeStyles = moduleTheme ? {
    borderLeftColor: moduleThemeColors[moduleTheme].primary,
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid' as const
  } : {};

  return (
    <SheetContent
      ref={ref}
      className={cn(
        // Base styling - clean white background and consistent sizing
        "bg-white border-gray-200",
        width,
        "overflow-y-auto",
        // Enhanced shadow for depth and professionalism
        "shadow-lg",
        // Custom className overrides
        className
      )}
      style={themeStyles}
      {...props}
    >
      {children}
    </SheetContent>
  );
});

AppSheetContent.displayName = "AppSheetContent";

export { AppSheetContent, type AppSheetContentProps };