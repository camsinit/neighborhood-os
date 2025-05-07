
/**
 * Module Theme Registry
 * 
 * This file contains the theme configuration for all modules in the application.
 * It defines the colors, gradients, and other styling properties associated with each module theme.
 */

// Theme color definitions for modules
export const moduleThemeColors = {
  calendar: {
    primary: "#0EA5E9", // bright blue
    light: "#E0F2FE",
    variable: "--calendar-color",
    lightVariable: "--calendar-light",
    icon: "Calendar"
  },
  skills: {
    primary: "#22C55E", // green
    light: "#DCFCE7",
    variable: "--skills-color",
    lightVariable: "--skills-light",
    icon: "Brain"
  },
  goods: {
    primary: "#F97316", // orange
    light: "#FFEDD5",
    variable: "--goods-color",
    lightVariable: "--goods-light",
    icon: "Gift"
  },
  safety: {
    primary: "#EA384C", // red
    light: "#FEE2E2",
    variable: "--safety-color", 
    lightVariable: "--safety-light",
    icon: "Shield"
  },
  neighbors: {
    primary: "#7E69AB", // secondary purple
    light: "#F5F3FF",
    variable: "--neighbors-color",
    lightVariable: "--neighbors-light",
    icon: "Users"
  }
} as const;

// Helper function to get a theme color value by module type
export const getModuleThemeColor = (
  moduleType: keyof typeof moduleThemeColors,
  variant: 'primary' | 'light' = 'primary'
): string => {
  return variant === 'primary' 
    ? moduleThemeColors[moduleType].primary 
    : moduleThemeColors[moduleType].light;
};

// Module registration interface for future extensibility
export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  themeColor: keyof typeof moduleThemeColors;
  path: string;
  icon: string;
  isEnabled: boolean;
}

// Core modules definition - to be used for module registration system
export const coreModules: ModuleDefinition[] = [
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Community events and gatherings',
    themeColor: 'calendar',
    path: '/calendar',
    icon: 'Calendar',
    isEnabled: true
  },
  {
    id: 'skills',
    name: 'Skills',
    description: 'Skills exchange and learning',
    themeColor: 'skills',
    path: '/skills',
    icon: 'Brain',
    isEnabled: true
  },
  {
    id: 'goods',
    name: 'Freebies',
    description: 'Items exchange and sharing',
    themeColor: 'goods',
    path: '/goods',
    icon: 'Gift',
    isEnabled: true
  },
  {
    id: 'safety',
    name: 'Updates',
    description: 'Neighborhood updates and information',
    themeColor: 'safety',
    path: '/safety',
    icon: 'Shield',
    isEnabled: true
  },
  {
    id: 'neighbors',
    name: 'Neighbors',
    description: 'Community members directory',
    themeColor: 'neighbors',
    path: '/neighbors',
    icon: 'Users',
    isEnabled: true
  }
];

export default moduleThemeColors;
