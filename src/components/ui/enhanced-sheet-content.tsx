import * as React from "react";
import { SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { moduleThemeColors } from "@/theme/moduleTheme";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

/**
 * Enhanced Sheet Content - Unified side panel component system
 * 
 * This component provides a consistent foundation for all side panels across the app
 * with enhanced theming, structured layouts, and reusable components.
 * 
 * Features:
 * - Standardized header with gradient theming
 * - Reusable profile card components
 * - Module-themed accents and borders
 * - Consistent spacing and typography
 * - Responsive design patterns
 */

// Define the module theme types
export type ModuleTheme = keyof typeof moduleThemeColors;

// Enhanced props interface that includes structured content sections
interface EnhancedSheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetContent> {
  /**
   * Module theme for consistent styling across the app
   */
  moduleTheme: ModuleTheme;
  /**
   * Custom width override (defaults to responsive sm:max-w-md)
   */
  width?: string;
}

/**
 * ProfileCardProps - Standardized profile information display
 */
interface ProfileCardProps {
  /**
   * User's display name
   */
  name: string;
  /**
   * User's avatar URL (optional)
   */
  avatarUrl?: string;
  /**
   * Whether this is the current user viewing their own profile
   */
  isCurrentUser?: boolean;
  /**
   * Additional badges to display (e.g., "Admin", "Verified", etc.)
   */
  badges?: Array<{
    text: string;
    variant?: 'default' | 'secondary' | 'outline';
  }>;
  /**
   * Metadata items to display below the name (e.g., join date, location)
   */
  metadata?: Array<{
    icon: React.ComponentType<{ className?: string }>;
    text: string;
    prominent?: boolean; // Whether to style as a prominent badge
  }>;
  /**
   * Module theme for consistent coloring
   */
  moduleTheme: ModuleTheme;
  /**
   * Additional content to display in the profile section
   */
  children?: React.ReactNode;
}

/**
 * SectionHeaderProps - Standardized section headers
 */
interface SectionHeaderProps {
  /**
   * Section title
   */
  title: string;
  /**
   * Icon to display next to the title
   */
  icon: React.ComponentType<{ className?: string }>;
  /**
   * Module theme for consistent coloring
   */
  moduleTheme: ModuleTheme;
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
  /**
   * Actions to display on the right side of the header
   */
  actions?: React.ReactNode;
}

/**
 * ContentSectionProps - Standardized content sections
 */
interface ContentSectionProps {
  /**
   * Module theme for consistent styling
   */
  moduleTheme: ModuleTheme;
  /**
   * Optional custom styling
   */
  className?: string;
  /**
   * Content to display
   */
  children: React.ReactNode;
}

/**
 * ProfileCard Component - Standardized profile display
 * 
 * Provides a consistent way to display user profile information across all sheets
 * with module-themed styling and flexible metadata display.
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  avatarUrl,
  isCurrentUser = false,
  badges = [],
  metadata = [],
  moduleTheme,
  children
}) => {
  const theme = moduleThemeColors[moduleTheme];
  
  return (
    <div 
      className="p-6 rounded-xl border-2"
      style={{ 
        background: `linear-gradient(135deg, ${theme.light} 0%, hsl(var(--background)) 100%)`,
        borderColor: `${theme.primary}33` // 20% opacity
      }}
    >
      <div className="flex items-start gap-6">
        {/* Avatar Section */}
        <div className="flex-shrink-0">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={avatarUrl || ''} />
              <AvatarFallback 
                className="text-2xl"
                style={{ 
                  backgroundColor: `${theme.primary}1A`, // 10% opacity
                  color: theme.primary 
                }}
              >
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            {/* Accent ring */}
            <div 
              className="absolute inset-0 rounded-full border-2 opacity-20"
              style={{ borderColor: theme.primary }}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          <div className="space-y-3">
            {/* Name and Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl font-bold text-gray-900">
                {name}
              </h3>
              {isCurrentUser && (
                <span 
                  className="text-sm font-normal px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${theme.primary}1A`, // 10% opacity
                    color: theme.primary 
                  }}
                >
                  You
                </span>
              )}
              {badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || 'default'}>
                  {badge.text}
                </Badge>
              ))}
            </div>
            
            {/* Metadata Row */}
            {metadata.length > 0 && (
              <div className="flex items-center gap-4 flex-wrap text-sm">
                {metadata.map((item, index) => {
                  const Icon = item.icon;
                  return item.prominent ? (
                    <div 
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: theme.primary, 
                        color: 'white' 
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {item.text}
                    </div>
                  ) : (
                    <div key={index} className="flex items-center gap-2 text-gray-600">
                      <Icon className="h-4 w-4" />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Additional content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * SectionHeader Component - Standardized section headers
 * 
 * Provides consistent styling for section headers throughout the sheet
 * with module theming and optional actions.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon: Icon,
  moduleTheme,
  subtitle,
  actions
}) => {
  const theme = moduleThemeColors[moduleTheme];
  
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 
          className="font-semibold text-lg flex items-center gap-2"
          style={{ color: theme.primary }}
        >
          <Icon className="w-5 h-5" />
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * ContentSection Component - Standardized content sections
 * 
 * Provides consistent styling for content sections with module theming.
 */
export const ContentSection: React.FC<ContentSectionProps> = ({
  moduleTheme,
  className,
  children
}) => {
  const theme = moduleThemeColors[moduleTheme];
  
  return (
    <div 
      className={cn(
        "p-4 rounded-lg border",
        className
      )}
      style={{ 
        backgroundColor: `${theme.primary}05`, // 2% opacity
        borderColor: `${theme.primary}1A` // 10% opacity
      }}
    >
      {children}
    </div>
  );
};

/**
 * EnhancedSheetContent Component
 * 
 * The main sheet content wrapper that provides the foundation for all
 * side panels with consistent theming and responsive behavior.
 */
const EnhancedSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetContent>,
  EnhancedSheetContentProps
>(({ 
  className, 
  children, 
  moduleTheme, 
  width = "sm:max-w-md",
  ...props 
}, ref) => {
  
  // Build the styling based on module theme
  const theme = moduleThemeColors[moduleTheme];
  const themeStyles = {
    borderLeftColor: theme.primary,
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid' as const
  };

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
      <div className="space-y-6">
        {children}
      </div>
    </SheetContent>
  );
});

EnhancedSheetContent.displayName = "EnhancedSheetContent";

export { 
  EnhancedSheetContent, 
  type EnhancedSheetContentProps,
  type ProfileCardProps,
  type SectionHeaderProps,
  type ContentSectionProps
};