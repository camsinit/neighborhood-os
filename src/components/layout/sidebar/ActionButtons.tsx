
/**
 * Action buttons component for the sidebar
 * 
 * This component renders the action buttons at the bottom of the sidebar
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@supabase/auth-helpers-react';
import { LogOut, Settings, Bug } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNeighborhood } from '@/contexts/neighborhood';

/**
 * ActionButtons props
 */
interface ActionButtonsProps {
  showDiagnostics: boolean;
  toggleDiagnostics: () => void;
}

/**
 * ActionButtons component for the sidebar
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  showDiagnostics, 
  toggleDiagnostics 
}) => {
  // Get current user and neighborhood
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood();
  
  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Only show debug button in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="space-y-2">
      {/* Only show settings if we have a neighborhood */}
      {currentNeighborhood && (
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={() => {
            const settingsDialog = document.getElementById('settings-dialog');
            if (settingsDialog) {
              (settingsDialog as any).showModal();
            }
          }}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      )}
      
      {/* Debug button only in development */}
      {isDevelopment && (
        <Button 
          variant="ghost" 
          className={`w-full justify-start ${showDiagnostics ? 'bg-slate-100' : ''}`}
          onClick={toggleDiagnostics}
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug
        </Button>
      )}
      
      {/* Show logout button if user is logged in */}
      {user && (
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
