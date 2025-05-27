
import React from 'react';
import { cn } from "@/lib/utils";

/**
 * Props for the SettingsCard component
 */
interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * SettingsCard Component
 * 
 * Provides a consistent card layout for settings sections with proper
 * spacing, shadows, and visual hierarchy.
 */
export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  className
}) => {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 shadow-sm",
      className
    )}>
      {/* Card header */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      
      {/* Card content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
