
import { Settings, Home, Plus, Zap } from "lucide-react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from 'react';
  import { Button } from "@/components/ui/button";
  import { useNeighborhood } from "@/contexts/neighborhood";
import { useCreateNeighborhoodAccess } from "@/hooks/useCreateNeighborhoodAccess";
import { CreateNeighborhoodDialog } from "@/components/neighborhoods/CreateNeighborhoodDialog";
// Import toast directly from sonner for success messages
import { toast as sonnerToast } from 'sonner';

/**
 * Header component props
 * onOpenSettings is a function that will be called when the settings option is clicked
 */
interface HeaderProps {
  onOpenSettings: () => void;
}

/**
 * Header component
 * 
 * Displays the top navigation bar with:
 * - Quick Actions title
 * - Notifications button
 * 
 * UPDATED: Removed neighborhood name display and profile dropdown
 */
const Header = ({
  onOpenSettings
}: HeaderProps) => {
  // Get the Supabase client for authentication actions
  const supabaseClient = useSupabaseClient();
  // Get the current user
  const user = useUser();
  // Get the navigation function from react-router
  const navigate = useNavigate();
  // Get the toast function for showing notifications
  const { toast } = useToast();
  
  // Get neighborhood context data for create neighborhood functionality
  const { currentNeighborhood } = useNeighborhood();
  const { hasAccess: canCreateNeighborhood } = useCreateNeighborhoodAccess();
  
  // State for create neighborhood dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      {/* Removed the 'border-b' class from the header to remove the bottom border stroke */}
      <header className="h-16 px-4 flex items-center justify-between">
        {/* Left side - Quick Actions title and create neighborhood option if applicable */}
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Quick Actions
          </h2>
          
          {/* Show create neighborhood option if user has access and no neighborhood */}
          {canCreateNeighborhood && !currentNeighborhood && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create neighborhood
            </Button>
          )}
        </div>
        
        {/* Right side - notifications now embedded in main content */}
        <div className="flex items-center gap-2">
          {/* Notifications moved to main content area */}
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
