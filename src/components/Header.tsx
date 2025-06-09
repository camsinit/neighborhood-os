
/**
 * Header Component
 * 
 * Main navigation header with user menu and notifications
 * UPDATED: Removed neighborhood switching - shows single neighborhood as static text
 * UPDATED: Removed profile dropdown from top right
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Home, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useNeighborhood } from '@/contexts/neighborhood';
// Import from the new notification system
import { NotificationPopover } from '@/notifications';
// Import the new neighborhood creation functionality
import { useCreateNeighborhoodAccess } from '@/hooks/useCreateNeighborhoodAccess';
import { CreateNeighborhoodDialog } from '@/components/neighborhoods/CreateNeighborhoodDialog';

const Header = () => {
  const navigate = useNavigate();
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood(); // Simplified - no switching
  const { hasAccess: canCreateNeighborhood } = useCreateNeighborhoodAccess();
  
  // State for create neighborhood dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand with Static Neighborhood Display */}
            <div className="flex items-center">
              <div className="flex items-center">
                <Home className="h-6 w-6 mr-2 text-blue-600" />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900">
                    {currentNeighborhood?.name || 'Neighborhood'}
                  </span>
                  {/* Show create option if user has access and no neighborhood */}
                  {canCreateNeighborhood && !currentNeighborhood && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCreateDialog(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create neighborhood
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Only Notifications now */}
            <div className="flex items-center space-x-4">
              {/* Notifications using the new system */}
              <NotificationPopover />
            </div>
          </div>
        </div>
      </header>

      {/* Create Neighborhood Dialog */}
      <CreateNeighborhoodDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
};

export default Header;
