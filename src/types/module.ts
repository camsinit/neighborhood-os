
/**
 * Module System Type Definitions
 * 
 * This file provides TypeScript type definitions for the module system.
 */

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Available theme colors for modules
 * Must match the keys in moduleThemeColors in theme/moduleTheme.ts
 */
export type ModuleThemeColor = 
  | 'calendar'
  | 'skills'
  | 'goods'
  | 'safety'
  | 'care'
  | 'neighbors';

/**
 * Module theme configuration
 */
export interface ModuleTheme {
  primary: string;
  light: string;
  variable: string;
  lightVariable: string;
  icon: string;
}

/**
 * Module definition interface
 */
export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  themeColor: ModuleThemeColor;
  path: string;
  icon: string;
  isEnabled: boolean;
}

/**
 * Module instance interface
 * Used for registering module components
 */
export interface ModuleInstance extends ModuleDefinition {
  component: React.ComponentType;
}

/**
 * Layout props for module pages
 */
export interface ModuleLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  themeColor: ModuleThemeColor;
  className?: string;
  showSkillsOnboardingOverlay?: boolean; // New prop for skills onboarding overlay
  onSkillsOnboardingComplete?: () => void; // Callback for completing skills onboarding
}

/**
 * Props for module container
 */
export interface ModuleContainerProps {
  children: ReactNode;
  themeColor: ModuleThemeColor;
  className?: string;
}

/**
 * Props for module content
 */
export interface ModuleContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Props for module header
 * 
 * Updated to remove description and actions which are now handled separately
 * for consistency across all pages
 */
export interface ModuleHeaderProps {
  title: string;
  description?: string; // Kept for backwards compatibility
  themeColor: ModuleThemeColor;
  actions?: ReactNode; // Kept for backwards compatibility
}
