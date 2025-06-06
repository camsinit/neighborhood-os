
/**
 * DebugVisibilityToggle component
 * 
 * A small toggle in the bottom left corner that allows hiding/showing
 * debug-related UI elements for clean screen recordings.
 * Only visible in development mode and to Super Admins.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useSuperAdminAccess } from '@/hooks/useSuperAdminAccess';

/**
 * Global state for debug visibility
 * Using a simple module-level variable since this is just for development/demo purposes
 */
let isDebugVisible = true;

/**
 * Hook to manage debug visibility state
 */
export const useDebugVisibility = () => {
  const [visible, setVisible] = useState(isDebugVisible);
  
  const toggleVisibility = () => {
    isDebugVisible = !isDebugVisible;
    setVisible(isDebugVisible);
  };
  
  return { visible, toggleVisibility };
};

/**
 * DebugVisibilityToggle component
 * Shows a small eye icon in the bottom left that toggles debug visibility
 */
const DebugVisibilityToggle = () => {
  const { isSuperAdmin } = useSuperAdminAccess();
  const { visible, toggleVisibility } = useDebugVisibility();
  
  // Only show in development and to super admins
  if (import.meta.env.PROD || !isSuperAdmin) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleVisibility}
        className="w-10 h-10 p-0 bg-background/80 backdrop-blur-sm border-muted"
        title={visible ? "Hide debug elements" : "Show debug elements"}
      >
        {visible ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};

export default DebugVisibilityToggle;
